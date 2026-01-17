-- ============================================================================
-- REMOVE REFERRAL SYSTEM
-- ============================================================================

-- Drop referrals table (policies will be removed automatically)
DROP TABLE IF EXISTS public.referrals CASCADE;

-- Remove referral fields from profiles
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS referral_code,
  DROP COLUMN IF EXISTS referred_by,
  DROP COLUMN IF EXISTS has_used_referral,
  DROP COLUMN IF EXISTS has_referral_discount,
  DROP COLUMN IF EXISTS free_months_earned,
  DROP COLUMN IF EXISTS free_months_used,
  DROP COLUMN IF EXISTS total_referrals;
