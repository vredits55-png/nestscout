-- ============================================================
-- NestScout Security Hardening Migration (Residual Fixes)
-- ============================================================

-- 1. Booking Requests: Enforce total_nights matches check_out - check_in difference
CREATE OR REPLACE FUNCTION public.validate_booking_request()
RETURNS trigger AS $$
DECLARE
  conv_property_id uuid;
  conv_tenant_id uuid;
BEGIN
  -- Fetch properties of the conversation
  SELECT property_id, tenant_id INTO conv_property_id, conv_tenant_id
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF conv_property_id IS NULL THEN
    RAISE EXCEPTION 'Conversation not found.';
  END IF;

  -- Ensure property and tenant IDs match the conversation records
  IF NEW.property_id <> conv_property_id THEN
    RAISE EXCEPTION 'Property ID does not match the conversation property ID.';
  END IF;

  IF NEW.tenant_id <> conv_tenant_id THEN
    RAISE EXCEPTION 'Tenant ID does not match the conversation tenant ID.';
  END IF;

  -- Validate check-in / check-out ranges
  IF NEW.check_out <= NEW.check_in THEN
    RAISE EXCEPTION 'Check-out date must be after check-in date.';
  END IF;

  IF NEW.check_in < CURRENT_DATE AND (TG_OP = 'INSERT' OR OLD.check_in <> NEW.check_in) THEN
    RAISE EXCEPTION 'Check-in date cannot be in the past.';
  END IF;

  IF NEW.proposed_price <= 0 THEN
    RAISE EXCEPTION 'Proposed price must be greater than zero.';
  END IF;

  IF NEW.total_nights <= 0 THEN
    RAISE EXCEPTION 'Total nights must be greater than zero.';
  END IF;

  -- Validate that total_nights matches the check_out - check_in range
  IF NEW.total_nights <> (NEW.check_out - NEW.check_in) THEN
    RAISE EXCEPTION 'Total nights must equal the difference between check-out and check-in dates.';
  END IF;

  -- Validate Update transitions and column modification locks
  IF TG_OP = 'UPDATE' THEN
    IF OLD.id IS DISTINCT FROM NEW.id OR
       OLD.conversation_id IS DISTINCT FROM NEW.conversation_id OR
       OLD.property_id IS DISTINCT FROM NEW.property_id OR
       OLD.tenant_id IS DISTINCT FROM NEW.tenant_id OR
       OLD.check_in IS DISTINCT FROM NEW.check_in OR
       OLD.check_out IS DISTINCT FROM NEW.check_out OR
       OLD.total_nights IS DISTINCT FROM NEW.total_nights OR
       OLD.proposed_price IS DISTINCT FROM NEW.proposed_price OR
       OLD.note IS DISTINCT FROM NEW.note OR
       OLD.created_at IS DISTINCT FROM NEW.created_at THEN
      RAISE EXCEPTION 'Cannot modify booking request parameters after creation. Only status can be changed.';
    END IF;

    IF OLD.status <> NEW.status THEN
      -- Tenant status transition (only allowed to cancel pending requests)
      IF auth.uid() = OLD.tenant_id THEN
        IF NEW.status <> 'cancelled' OR OLD.status <> 'pending' THEN
          RAISE EXCEPTION 'Tenants are only permitted to cancel pending booking requests.';
        END IF;
      -- Landlord status transition (only allowed to accept/reject pending requests)
      ELSIF EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = OLD.conversation_id AND c.landlord_id = auth.uid()
      ) THEN
        IF NEW.status NOT IN ('accepted', 'rejected') OR OLD.status <> 'pending' THEN
          RAISE EXCEPTION 'Landlords are only permitted to accept or reject pending booking requests.';
        END IF;
      ELSE
        RAISE EXCEPTION 'Unauthorized booking status change.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Revoke client insertion on the notifications table to prevent spam/spoofing
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;


-- 3. Automatically create notification on conversation events (Insert / Update)
CREATE OR REPLACE FUNCTION public.handle_conversation_notification()
RETURNS trigger AS $$
DECLARE
  tenant_name text;
  property_title text;
BEGIN
  -- Case 1: Insert (New rent enquiry)
  IF TG_OP = 'INSERT' THEN
    SELECT full_name INTO tenant_name FROM public.profiles WHERE id = NEW.tenant_id;
    SELECT title INTO property_title FROM public.properties WHERE id = NEW.property_id;
    
    INSERT INTO public.notifications (user_id, sender_id, type, title, message, link, is_read)
    VALUES (
      NEW.landlord_id,
      NEW.tenant_id,
      'enquiry',
      'New Rent Enquiry',
      coalesce(tenant_name, 'A renter') || ' sent an enquiry for "' || coalesce(property_title, 'your property') || '".',
      '/conversations/' || NEW.id,
      false
    );
  END IF;

  -- Case 2: Update
  IF TG_OP = 'UPDATE' THEN
    -- Case 2a: Restored (deletion_status changed from requested to none/cancelled)
    IF OLD.deletion_status = 'requested' AND NEW.deletion_status = 'none' THEN
      SELECT full_name INTO tenant_name FROM public.profiles WHERE id = NEW.tenant_id;
      SELECT title INTO property_title FROM public.properties WHERE id = NEW.property_id;
      
      INSERT INTO public.notifications (user_id, sender_id, type, title, message, link, is_read)
      VALUES (
        NEW.landlord_id,
        NEW.tenant_id,
        'enquiry',
        'New Rent Enquiry',
        coalesce(tenant_name, 'A renter') || ' sent an enquiry for "' || coalesce(property_title, 'your property') || '".',
        '/conversations/' || NEW.id,
        false
      );
    END IF;

    -- Case 2b: Deletion Requested
    IF OLD.deletion_status IS DISTINCT FROM NEW.deletion_status AND NEW.deletion_status = 'requested' AND NEW.deletion_requested_by IS NOT NULL THEN
      DECLARE
        recipient_id uuid;
        sender_name text;
      BEGIN
        IF NEW.deletion_requested_by = NEW.tenant_id THEN
          recipient_id := NEW.landlord_id;
        ELSE
          recipient_id := NEW.tenant_id;
        END IF;
        
        SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.deletion_requested_by;
        SELECT title INTO property_title FROM public.properties WHERE id = NEW.property_id;
        
        INSERT INTO public.notifications (user_id, sender_id, type, title, message, link, is_read)
        VALUES (
          recipient_id,
          NEW.deletion_requested_by,
          'deletion_request',
          'Conversation Deletion Requested',
          coalesce(sender_name, 'The other party') || ' requested to delete the conversation for "' || coalesce(property_title, 'property') || '".',
          '/conversations/' || NEW.id,
          false
        );
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_conversation_notification ON public.conversations;
CREATE TRIGGER trigger_conversation_notification
  AFTER INSERT OR UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_conversation_notification();


-- 4. Automatically create notification on booking_request creation
CREATE OR REPLACE FUNCTION public.handle_booking_request_notification()
RETURNS trigger AS $$
DECLARE
  tenant_name text;
  property_title text;
  landlord_id uuid;
BEGIN
  -- Fetch landlord_id and property title
  SELECT c.landlord_id, p.title INTO landlord_id, property_title
  FROM public.conversations c
  JOIN public.properties p ON p.id = c.property_id
  WHERE c.id = NEW.conversation_id;

  SELECT full_name INTO tenant_name FROM public.profiles WHERE id = NEW.tenant_id;

  IF landlord_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, sender_id, type, title, message, link, is_read)
    VALUES (
      landlord_id,
      NEW.tenant_id,
      'booking_request',
      'New Booking Request',
      coalesce(tenant_name, 'A renter') || ' requested to book "' || coalesce(property_title, 'your property') || '".',
      '/conversations/' || NEW.conversation_id,
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_booking_request_notification ON public.booking_requests;
CREATE TRIGGER trigger_booking_request_notification
  AFTER INSERT ON public.booking_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_booking_request_notification();
