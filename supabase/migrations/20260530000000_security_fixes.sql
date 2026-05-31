-- ============================================================
-- NestScout Consolidated Security Hardening Migration
-- ============================================================

-- ------------------------------------------------------------
-- 1. Profiles Table Division & Separation
-- ------------------------------------------------------------

-- Create profiles_private table if not exists
CREATE TABLE IF NOT EXISTS public.profiles_private (
  id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  phone text,
  provider text NOT NULL DEFAULT 'email',
  linked_providers text[] NOT NULL DEFAULT '{}'
);

-- Copy existing sensitive columns from profiles to profiles_private if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    INSERT INTO public.profiles_private (id, email, phone, provider, linked_providers)
    SELECT id, email, phone, COALESCE(provider, 'email'), COALESCE(linked_providers, '{}')
    FROM public.profiles
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Drop sensitive columns from profiles table to prevent leakage
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS provider;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS linked_providers;

-- Enable RLS on profiles_private and define secure policies
ALTER TABLE public.profiles_private ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own private profile" ON public.profiles_private;
CREATE POLICY "Users can view their own private profile"
  ON public.profiles_private FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can update their own private profile" ON public.profiles_private;
CREATE POLICY "Users can update their own private profile"
  ON public.profiles_private FOR UPDATE
  USING (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can insert their own private profile" ON public.profiles_private;
CREATE POLICY "Users can insert their own private profile"
  ON public.profiles_private FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can delete their own private profile" ON public.profiles_private;
CREATE POLICY "Users can delete their own private profile"
  ON public.profiles_private FOR DELETE
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- Redefine handle_new_user to write to both profiles and profiles_private
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'undecided')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles_private (id, email, provider)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'provider',
      new.raw_app_meta_data->>'provider',
      'email'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Prevent Role Modifications After Initial Choice
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


-- ------------------------------------------------------------
-- 2. Properties Table RLS
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- 3. Conversations Table Validation & Triggers
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- 4. Booking Requests Table Validation & Triggers & RLS
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_booking_request()
RETURNS trigger AS $$
DECLARE
  conv_property_id uuid;
  conv_tenant_id uuid;
BEGIN
  SELECT property_id, tenant_id INTO conv_property_id, conv_tenant_id
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF conv_property_id IS NULL THEN
    RAISE EXCEPTION 'Conversation not found.';
  END IF;

  IF NEW.property_id <> conv_property_id THEN
    RAISE EXCEPTION 'Property ID does not match the conversation property ID.';
  END IF;

  IF NEW.tenant_id <> conv_tenant_id THEN
    RAISE EXCEPTION 'Tenant ID does not match the conversation tenant ID.';
  END IF;

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
      IF auth.uid() = OLD.tenant_id THEN
        IF NEW.status <> 'cancelled' OR OLD.status <> 'pending' THEN
          RAISE EXCEPTION 'Tenants are only permitted to cancel pending booking requests.';
        END IF;
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


-- ------------------------------------------------------------
-- 5. Messages Table: Lock Updates Strictly to is_read Receipts
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- 6. Notifications Table Trigger & Policies
-- ------------------------------------------------------------

-- Revoke direct insertion from clients
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

-- Auto-create notifications on conversation update/insert
CREATE OR REPLACE FUNCTION public.handle_conversation_notification()
RETURNS trigger AS $$
DECLARE
  tenant_name text;
  property_title text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT full_name INTO tenant_name FROM public.profiles WHERE id = NEW.tenant_id;
    SELECT title INTO property_title FROM public.properties WHERE id = NEW.property_id;
    
    INSERT INTO public.notifications (user_id, sender_id, type, title, message, link, is_read)
    VALUES (
      NEW.landlord_id,
      NEW.tenant_id,
      'enquiry',
      'New Rent Enquiry',
      COALESCE(tenant_name, 'A renter') || ' sent an enquiry for "' || COALESCE(property_title, 'your property') || '".',
      '/conversations/' || NEW.id,
      false
    );
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.deletion_status = 'requested' AND NEW.deletion_status = 'none' THEN
      SELECT full_name INTO tenant_name FROM public.profiles WHERE id = NEW.tenant_id;
      SELECT title INTO property_title FROM public.properties WHERE id = NEW.property_id;
      
      INSERT INTO public.notifications (user_id, sender_id, type, title, message, link, is_read)
      VALUES (
        NEW.landlord_id,
        NEW.tenant_id,
        'enquiry',
        'New Rent Enquiry',
        COALESCE(tenant_name, 'A renter') || ' sent an enquiry for "' || COALESCE(property_title, 'your property') || '".',
        '/conversations/' || NEW.id,
        false
      );
    END IF;

    IF OLD.deletion_status IS DISTINCT FROM NEW.deletion_status AND NEW.deletion_status = 'requested' AND NEW.deletion_requested_by IS NOT NULL THEN
      DECLARE
        recipient_id uuid;
        sender_name text;
      BEGIN
        IF NEW.deletion_requested_by = NEW.tenant_id THEN
          recipient_id := NEW.landlord_id;
        ELSE
          recipient_id := NEW.tenant_id;
        END If;
        
        SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.deletion_requested_by;
        SELECT title INTO property_title FROM public.properties WHERE id = NEW.property_id;
        
        INSERT INTO public.notifications (user_id, sender_id, type, title, message, link, is_read)
        VALUES (
          recipient_id,
          NEW.deletion_requested_by,
          'deletion_request',
          'Conversation Deletion Requested',
          COALESCE(sender_name, 'The other party') || ' requested to delete the conversation for "' || COALESCE(property_title, 'property') || '".',
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

-- Auto-create notifications on booking request
CREATE OR REPLACE FUNCTION public.handle_booking_request_notification()
RETURNS trigger AS $$
DECLARE
  tenant_name text;
  property_title text;
  landlord_id uuid;
BEGIN
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
      COALESCE(tenant_name, 'A renter') || ' requested to book "' || COALESCE(property_title, 'your property') || '".',
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


-- ------------------------------------------------------------
-- 7. Storage: property-images Upload Policy
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'property-images' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'provider'
    )
  );


-- ------------------------------------------------------------
-- 8. Inquiries: Insertion & Modification RLS and Triggers
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated users can send inquiries" ON public.inquiries;
CREATE POLICY "Authenticated users can send inquiries"
  ON public.inquiries FOR INSERT WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND provider_id = receiver_id
    )
  );

CREATE OR REPLACE FUNCTION public.prevent_inquiry_modification()
RETURNS trigger AS $$
BEGIN
  IF OLD.id IS DISTINCT FROM NEW.id OR
     OLD.property_id IS DISTINCT FROM NEW.property_id OR
     OLD.sender_id IS DISTINCT FROM NEW.sender_id OR
     OLD.receiver_id IS DISTINCT FROM NEW.receiver_id OR
     OLD.message IS DISTINCT FROM NEW.message OR
     OLD.created_at IS DISTINCT FROM NEW.created_at THEN
    RAISE EXCEPTION 'Only the is_read column can be updated on inquiries.';
  END IF;

  IF OLD.sender_id = auth.uid() AND OLD.is_read IS DISTINCT FROM NEW.is_read THEN
    RAISE EXCEPTION 'You cannot mark your own inquiries as read.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_inquiry_update ON public.inquiries;
CREATE TRIGGER check_inquiry_update
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.prevent_inquiry_modification();


-- ------------------------------------------------------------
-- 9. Reviews: Stay Verification Policy
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated users can submit reviews" ON public.reviews;
CREATE POLICY "Authenticated users can submit reviews"
  ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.booking_requests br
      WHERE br.tenant_id = auth.uid() 
      AND br.property_id = reviews.property_id 
      AND br.status = 'accepted'
    )
  );


-- ------------------------------------------------------------
-- 10. RPC Helper Functions & Access Privileges
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_profile_id_by_email(email_to_check text)
RETURNS uuid AS $$
DECLARE
  found_id uuid;
BEGIN
  SELECT id INTO found_id FROM public.profiles_private WHERE email = email_to_check LIMIT 1;
  RETURN found_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_email_by_username(username_to_check text)
RETURNS text AS $$
DECLARE
  found_email text;
BEGIN
  SELECT email INTO found_email FROM public.profiles_private WHERE split_part(email, '@', 1) = username_to_check LIMIT 1;
  RETURN found_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Limit execute rights to authorized roles
REVOKE EXECUTE ON FUNCTION public.get_profile_id_by_email(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_id_by_email(text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_email_by_username(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO service_role;


-- ------------------------------------------------------------
-- 11. Private Profiles Trigger & Vetted Update RPC
-- ------------------------------------------------------------

-- Trigger to lock down sensitive fields in profiles_private
CREATE OR REPLACE FUNCTION public.check_profiles_private_update()
RETURNS trigger AS $$
DECLARE
  vetted_update text;
BEGIN
  -- If service role is updating, bypass all checks
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Email cannot be updated
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    RAISE EXCEPTION 'Updates to email are not permitted.';
  END IF;

  -- Provider cannot be updated
  IF OLD.provider IS DISTINCT FROM NEW.provider THEN
    RAISE EXCEPTION 'Updates to provider are not permitted.';
  END IF;

  -- linked_providers can only be updated if vetted_update is set to 'true' in the transaction
  IF OLD.linked_providers IS DISTINCT FROM NEW.linked_providers THEN
    BEGIN
      vetted_update := current_setting('app.vetted_update', true);
    EXCEPTION WHEN OTHERS THEN
      vetted_update := NULL;
    END;
    
    IF vetted_update IS DISTINCT FROM 'true' THEN
      RAISE EXCEPTION 'Direct updates to linked_providers are not permitted. Use the vetted RPC path.';
    END IF;
  END IF;

  -- Ensure users can only update their own row
  IF auth.uid() <> NEW.id THEN
    RAISE EXCEPTION 'Unauthorized update of private profile.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_check_profiles_private_update ON public.profiles_private;
CREATE TRIGGER trigger_check_profiles_private_update
  BEFORE UPDATE ON public.profiles_private
  FOR EACH ROW EXECUTE FUNCTION public.check_profiles_private_update();

-- Secure RPC to allow vetted updating of linked_providers
CREATE OR REPLACE FUNCTION public.update_linked_providers(user_id uuid, new_providers text[])
RETURNS void AS $$
BEGIN
  -- Ensure that the caller is the owner or the service role
  IF auth.uid() <> user_id AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized to update linked providers.';
  END IF;

  -- Set transaction-local vetted update config flag
  PERFORM set_config('app.vetted_update', 'true', true);

  UPDATE public.profiles_private
  SET linked_providers = new_providers
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Limit execute rights on update_linked_providers
REVOKE EXECUTE ON FUNCTION public.update_linked_providers(uuid, text[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.update_linked_providers(uuid, text[]) TO authenticated, service_role;

