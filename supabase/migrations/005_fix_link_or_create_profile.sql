-- Fix auth trigger to avoid duplicate email inserts on verify
CREATE OR REPLACE FUNCTION public.link_or_create_profile(
    p_auth_id UUID,
    p_email TEXT,
    p_meta JSONB
)
RETURNS VOID AS $$
DECLARE
    existing_profile_id TEXT;
BEGIN
    IF p_email IS NULL THEN
        RETURN;
    END IF;

    -- If already linked, do nothing
    IF EXISTS (SELECT 1 FROM public.profiles WHERE auth_id = p_auth_id) THEN
        RETURN;
    END IF;

    -- If a profile exists with this email and no auth_id, link it
    SELECT id INTO existing_profile_id
    FROM public.profiles
    WHERE LOWER(email) = LOWER(p_email)
      AND auth_id IS NULL
    LIMIT 1;

    IF existing_profile_id IS NOT NULL THEN
        UPDATE public.profiles
        SET
            auth_id = p_auth_id,
            status = 'CLAIMED',
            is_unclaimed = FALSE,
            updated_at = NOW()
        WHERE id = existing_profile_id;
        RETURN;
    END IF;

    -- If a profile already exists with this email (linked), do nothing
    IF EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(email) = LOWER(p_email)) THEN
        RETURN;
    END IF;

    -- Create a new profile for a new user
    INSERT INTO public.profiles (
        id,
        auth_id,
        email,
        status,
        is_unclaimed,
        full_name,
        display_name,
        created_at,
        updated_at
    )
    VALUES (
        p_auth_id::TEXT,
        p_auth_id,
        p_email,
        'NEW',
        FALSE,
        COALESCE(p_meta->>'full_name', p_meta->>'name', split_part(p_email, '@', 1)),
        COALESCE(p_meta->>'full_name', p_meta->>'name', split_part(p_email, '@', 1)),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
