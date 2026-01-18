ALTER TABLE public.community_event_signups
ADD COLUMN IF NOT EXISTS event_location TEXT;
