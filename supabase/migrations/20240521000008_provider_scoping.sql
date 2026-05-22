-- Add provider column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider text;

-- Update existing profiles to 'email' if null
UPDATE public.profiles SET provider = 'email' WHERE provider IS NULL;

-- Make provider NOT NULL and set default to 'email'
ALTER TABLE public.profiles ALTER COLUMN provider SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN provider SET DEFAULT 'email';

-- Update the handle_new_user trigger function to capture the authentication provider
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, provider)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'undecided'),
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
