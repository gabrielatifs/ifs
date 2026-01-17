-- ============================================================================
-- AUTH TRIGGERS FOR LEGACY USER CLAIMING (OPTION A)
-- ============================================================================
-- Strategy:
-- 1) Legacy profiles keep their legacy ID as profiles.id (TEXT)
-- 2) New users get profiles.id = auth.users.id::text
-- 3) When email is verified, link legacy profile by email or create new profile
-- ============================================================================

-- ============================================================================
-- CORE LINK/CREATE LOGIC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.link_or_create_profile(
    p_auth_id UUID,
    p_email TEXT,
    p_meta JSONB
)
RETURNS VOID AS $$
DECLARE
    legacy_profile_id TEXT;
BEGIN
    IF p_email IS NULL THEN
        RETURN;
    END IF;

    -- If already linked, do nothing
    IF EXISTS (SELECT 1 FROM public.profiles WHERE auth_id = p_auth_id) THEN
        RETURN;
    END IF;

    -- Look for an unclaimed legacy profile by email (case-insensitive)
    SELECT id INTO legacy_profile_id
    FROM public.profiles
    WHERE LOWER(email) = LOWER(p_email)
      AND status = 'LEGACY'
      AND auth_id IS NULL
    LIMIT 1;

    IF legacy_profile_id IS NOT NULL THEN
        -- Claim legacy profile
        UPDATE public.profiles
        SET
            auth_id = p_auth_id,
            status = 'CLAIMED',
            is_unclaimed = FALSE,
            updated_at = NOW()
        WHERE id = legacy_profile_id;

        RAISE LOG 'link_or_create_profile: Claimed legacy profile % for %', legacy_profile_id, p_email;
    ELSE
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

        RAISE LOG 'link_or_create_profile: Created new profile % for %', p_auth_id, p_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: ON AUTH USER CREATED
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_auth_user_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Only link/create once email is verified
    IF NEW.email_confirmed_at IS NULL THEN
        RETURN NEW;
    END IF;

    PERFORM public.link_or_create_profile(NEW.id, NEW.email, NEW.raw_user_meta_data);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_insert();

-- ============================================================================
-- TRIGGER: ON EMAIL CONFIRMED
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_auth_user_confirmed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS NOT NULL THEN
        RETURN NEW;
    END IF;

    PERFORM public.link_or_create_profile(NEW.id, NEW.email, NEW.raw_user_meta_data);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
    AFTER UPDATE OF email_confirmed_at ON auth.users
    FOR EACH ROW
    WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
    EXECUTE FUNCTION public.handle_auth_user_confirmed();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS TEXT AS $$
    SELECT id FROM public.profiles WHERE auth_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.auth_email_matches(record_email TEXT)
RETURNS BOOLEAN AS $$
    SELECT LOWER(auth.email()) = LOWER(record_email);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_linked_profile()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE auth_id = auth.uid());
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.email_matches_if_linked(record_email TEXT)
RETURNS BOOLEAN AS $$
    SELECT public.has_linked_profile() AND public.auth_email_matches(record_email);
$$ LANGUAGE sql STABLE SECURITY DEFINER;
