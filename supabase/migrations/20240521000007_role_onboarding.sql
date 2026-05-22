-- Disable the check constraint on role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add updated check constraint allowing 'undecided'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('provider', 'client', 'undecided'));

-- Change default to 'undecided'
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'undecided';

-- Update handle_new_user trigger function to default to 'undecided' when meta_data lacks a role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'undecided')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
