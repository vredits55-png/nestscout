-- ============================================
-- NestScout: Prevent landlords from renting their own properties
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'check_different_users'
    ) THEN
        ALTER TABLE public.conversations
        ADD CONSTRAINT check_different_users CHECK (tenant_id <> landlord_id);
    END IF;
END $$;
