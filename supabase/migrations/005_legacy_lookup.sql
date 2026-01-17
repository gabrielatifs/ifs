-- ============================================================================
-- Legacy lookup helper for unauthenticated login flows
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_legacy_unclaimed(p_email TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE status = 'LEGACY'
      AND auth_id IS NULL
      AND LOWER(email) = LOWER(p_email)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_legacy_unclaimed(TEXT) TO anon, authenticated;
