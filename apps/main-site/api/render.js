/**
 * Vercel Serverless Function for Dynamic Page Rendering
 *
 * This API route fetches dynamic content (jobs, courses, events) from Supabase
 * and returns HTML with correct meta tags for social crawlers and search engines.
 *
 * Usage: /api/render?path=/job/senior-developer-abc12345
 */

import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://ifs-safeguarding.co.uk';
const DEFAULT_OG_IMAGE =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/ifs-og-image.png';
const FAVICON_URL =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9a3d96daf168696381e05/36f9296bf_27May-BoardofTrusteesMeeting6.png';

/**
 * Extract job ID from slug (format: title-company-{id8chars})
 */
function extractJobIdFromSlug(slug) {
  const parts = slug.split('-');
  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1];
    if (lastPart.length === 8) {
      return lastPart;
    }
  }
  return null;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strip HTML tags from string
 */
function stripHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Generate HTML page with meta tags
 */
function generateHtml({ title, description, url, image, type = 'website', canonicalPath }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeUrl = escapeHtml(url);
  const safeImage = escapeHtml(image || DEFAULT_OG_IMAGE);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />
  <link rel="canonical" href="${safeUrl}" />
  <link rel="icon" type="image/png" href="${FAVICON_URL}" />

  <!-- Open Graph -->
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:site_name" content="Independent Federation for Safeguarding" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImage}" />

  <!-- Redirect script for users who land here directly -->
  <script>
    // If JavaScript is enabled, redirect to the actual page
    // This ensures crawlers get the meta tags while users get the full SPA experience
    if (typeof window !== 'undefined') {
      window.location.replace('${escapeHtml(canonicalPath)}');
    }
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalPath)}" />
  </noscript>
</head>
<body>
  <div id="root">
    <main style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto;">
      <h1>${safeTitle}</h1>
      <p>${safeDescription}</p>
      <p><a href="${escapeHtml(canonicalPath)}">View full page</a></p>
    </main>
  </div>
</body>
</html>`;
}

/**
 * Default fallback HTML
 */
function generateFallbackHtml(path) {
  return generateHtml({
    title: 'Independent Federation for Safeguarding',
    description:
      "Join the UK's trusted professional body for safeguarding. Connect with peers, access essential resources, and advance your expertise.",
    url: `${BASE_URL}${path}`,
    canonicalPath: path,
  });
}

export default async function handler(req, res) {
  const { path: pagePath, id, type } = req.query;

  if (!pagePath) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  // Initialize Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(generateFallbackHtml(pagePath));
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Handle job detail pages: /job/:slug or /join/:slug
    if (pagePath.startsWith('/job/') || pagePath.startsWith('/join/')) {
      const slug = pagePath.split('/')[2];
      const jobIdPrefix = extractJobIdFromSlug(slug);

      if (jobIdPrefix) {
        const { data: job, error } = await supabase
          .from('jobs')
          .select('id, title, company_name, location, description, salary_range')
          .ilike('id', `${jobIdPrefix}%`)
          .single();

        if (job && !error) {
          const title = `${job.title}${job.location ? ` - ${job.location}` : ''} | IfS Jobs`;
          const description =
            stripHtml(job.description)?.substring(0, 155) + '...' ||
            `${job.title} at ${job.company_name || 'Organisation'}. View details and apply on the IfS Jobs Board.`;

          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate');
          return res.status(200).send(
            generateHtml({
              title,
              description,
              url: `${BASE_URL}${pagePath}`,
              type: 'article',
              canonicalPath: pagePath,
            })
          );
        }
      }
    }

    // Handle course detail pages: /course/:slug
    else if (pagePath.startsWith('/course/')) {
      const slug = pagePath.split('/')[2];
      const courseId = id || slug;

      const { data: course, error } = await supabase
        .from('courses')
        .select('id, title, description, category')
        .eq('id', courseId)
        .single();

      if (course && !error) {
        const title = `${course.title} | IfS Training`;
        const description =
          stripHtml(course.description)?.substring(0, 155) + '...' ||
          `${course.title} - CPD-accredited safeguarding training from the Independent Federation for Safeguarding.`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate');
        return res.status(200).send(
          generateHtml({
            title,
            description,
            url: `${BASE_URL}${pagePath}`,
            type: 'article',
            canonicalPath: pagePath,
          })
        );
      }
    }

    // Handle event detail pages: /event/:id
    else if (pagePath.startsWith('/event/')) {
      const eventId = pagePath.split('/')[2] || id;
      const eventType = type;

      let event = null;

      if (eventType === 'community') {
        const { data, error } = await supabase
          .from('community_events')
          .select('id, title, description, date, location')
          .eq('id', eventId)
          .single();
        if (!error) event = data;
      } else {
        const { data, error } = await supabase
          .from('events')
          .select('id, title, description, date, location')
          .eq('id', eventId)
          .single();
        if (!error) event = data;
      }

      if (event) {
        const dateStr = event.date
          ? new Date(event.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : '';
        const title = `${event.title}${dateStr ? ` - ${dateStr}` : ''} | IfS Events`;
        const description =
          stripHtml(event.description)?.substring(0, 155) + '...' ||
          `${event.title}${event.location ? ` at ${event.location}` : ''}. Join this IfS professional event.`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate');
        return res.status(200).send(
          generateHtml({
            title,
            description,
            url: `${BASE_URL}${pagePath}`,
            type: 'event',
            canonicalPath: pagePath,
          })
        );
      }
    }

    // Fallback for unmatched or not found
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).send(generateFallbackHtml(pagePath));
  } catch (error) {
    console.error('Render API error:', error);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(generateFallbackHtml(pagePath));
  }
}
