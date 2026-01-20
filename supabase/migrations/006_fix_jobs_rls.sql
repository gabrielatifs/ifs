-- Make the jobs policy case-insensitive on status
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;

CREATE POLICY "Anyone can view active jobs" ON public.jobs
    FOR SELECT USING (LOWER(status) = 'active');
