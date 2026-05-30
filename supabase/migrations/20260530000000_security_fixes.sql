-- ============================================================
-- NestScout Security Hardening Migration
-- ============================================================

-- 1. Profiles Table: Prevent Role Modifications After Initial Choice
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role AND OLD.role IN ('provider', 'client') THEN
    RAISE EXCEPTION 'Role cannot be changed once selected.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_role_update ON public.profiles;
CREATE TRIGGER check_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();


-- 2. Properties Table: Restrict Create/Update Policies to Certified Providers Only
DROP POLICY IF EXISTS "Providers can insert properties" ON public.properties;
CREATE POLICY "Providers can insert properties"
  ON public.properties FOR INSERT WITH CHECK (
    auth.uid() = provider_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'provider'
    )
  );

DROP POLICY IF EXISTS "Providers can update their own properties" ON public.properties;
CREATE POLICY "Providers can update their own properties"
  ON public.properties FOR UPDATE USING (
    auth.uid() = provider_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'provider'
    )
  );

DROP POLICY IF EXISTS "Providers can delete their own properties" ON public.properties;
CREATE POLICY "Providers can delete their own properties"
  ON public.properties FOR DELETE USING (
    auth.uid() = provider_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'provider'
    )
  );


-- 3. Conversations Table: Verify Landlord ID Matches Property Provider ID
CREATE OR REPLACE FUNCTION public.validate_conversation()
RETURNS trigger AS $$
DECLARE
  prop_provider_id uuid;
BEGIN
  SELECT provider_id INTO prop_provider_id
  FROM public.properties
  WHERE id = NEW.property_id;

  IF prop_provider_id IS NULL THEN
    RAISE EXCEPTION 'Property not found.';
  END IF;

  IF NEW.landlord_id <> prop_provider_id THEN
    RAISE EXCEPTION 'Landlord ID must match the property owner ID.';
  END IF;

  IF NEW.tenant_id = NEW.landlord_id THEN
    RAISE EXCEPTION 'You cannot start a conversation on your own property.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_conversation ON public.conversations;
CREATE TRIGGER check_conversation
  BEFORE INSERT OR UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.validate_conversation();


-- 4. Booking Requests Table: Tighten Creation, Status Updates, Mismatches, and Constraints
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

DROP TRIGGER IF EXISTS check_booking_request ON public.booking_requests;
CREATE TRIGGER check_booking_request
  BEFORE INSERT OR UPDATE ON public.booking_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking_request();


-- 5. Booking Requests RLS Policies Alignment
DROP POLICY IF EXISTS "Tenants can update their own booking requests" ON public.booking_requests;
CREATE POLICY "Tenants can update their own booking requests"
  ON public.booking_requests FOR UPDATE USING (
    auth.uid() = tenant_id
  ) WITH CHECK (
    status = 'cancelled'
  );

DROP POLICY IF EXISTS "Landlords can update booking requests" ON public.booking_requests;
CREATE POLICY "Landlords can update booking requests"
  ON public.booking_requests FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.landlord_id = auth.uid()
    )
  ) WITH CHECK (
    status IN ('accepted', 'rejected')
  );


-- 6. Messages Table: Lock Updates Strictly to is_read Receipts
CREATE OR REPLACE FUNCTION public.prevent_message_modification()
RETURNS trigger AS $$
BEGIN
  IF OLD.id IS DISTINCT FROM NEW.id OR
     OLD.conversation_id IS DISTINCT FROM NEW.conversation_id OR
     OLD.sender_id IS DISTINCT FROM NEW.sender_id OR
     OLD.content IS DISTINCT FROM NEW.content OR
     OLD.message_type IS DISTINCT FROM NEW.message_type OR
     OLD.created_at IS DISTINCT FROM NEW.created_at THEN
    RAISE EXCEPTION 'Only the is_read column can be updated on messages.';
  END IF;

  IF OLD.sender_id = auth.uid() AND OLD.is_read IS DISTINCT FROM NEW.is_read THEN
    RAISE EXCEPTION 'You cannot mark your own messages as read.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_message_update ON public.messages;
CREATE TRIGGER check_message_update
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.prevent_message_modification();


-- 7. Notifications Table: Harden Insert Policy to Prevent Spoofing and Spam
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND (
      EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE (c.tenant_id = auth.uid() AND c.landlord_id = user_id)
        OR (c.landlord_id = auth.uid() AND c.tenant_id = user_id)
      )
      OR EXISTS (
        SELECT 1 FROM public.inquiries i
        WHERE (i.sender_id = auth.uid() AND i.receiver_id = user_id)
        OR (i.receiver_id = auth.uid() AND i.sender_id = user_id)
      )
    )
  );
