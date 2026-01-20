-- Backfill public_job_url for existing jobs using new slug format
WITH job_slugs AS (
    SELECT
        id,
        lower(
            regexp_replace(
                regexp_replace(
                    regexp_replace(coalesce(title, ''), '[^a-zA-Z0-9]+', '-', 'g'),
                    '-{2,}', '-', 'g'
                ),
                '(^-|-$)', '', 'g'
            )
        ) AS title_slug,
        lower(
            regexp_replace(
                regexp_replace(
                    regexp_replace(coalesce(address_locality, location, ''), '[^a-zA-Z0-9]+', '-', 'g'),
                    '-{2,}', '-', 'g'
                ),
                '(^-|-$)', '', 'g'
            )
        ) AS location_slug,
        lower(
            regexp_replace(
                regexp_replace(
                    regexp_replace(coalesce(company_name, submitted_by_organisation_name, ''), '[^a-zA-Z0-9]+', '-', 'g'),
                    '-{2,}', '-', 'g'
                ),
                '(^-|-$)', '', 'g'
            )
        ) AS company_slug
    FROM public.jobs
)
UPDATE public.jobs j
SET public_job_url = '/job/' || concat_ws('-', title_slug, location_slug, company_slug)
FROM job_slugs s
WHERE j.id = s.id
  AND (j.public_job_url IS NULL OR j.public_job_url = '');
