import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = process.env.VITE_MAIN_SITE_URL || 'https://www.join-ifs.org';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Static routes
const staticRoutes = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/About', priority: 0.9, changefreq: 'monthly' },
  { path: '/Membership', priority: 0.9, changefreq: 'weekly' },
  { path: '/Training', priority: 0.9, changefreq: 'weekly' },
  { path: '/Events', priority: 0.9, changefreq: 'daily' },
  { path: '/Jobs', priority: 0.9, changefreq: 'daily' },
  { path: '/Contact', priority: 0.8, changefreq: 'monthly' },
  { path: '/MembershipTiers', priority: 0.8, changefreq: 'monthly' },
  { path: '/MemberBenefits', priority: 0.8, changefreq: 'monthly' },
  { path: '/AssociateMembership', priority: 0.8, changefreq: 'monthly' },
  { path: '/FullMembership', priority: 0.8, changefreq: 'monthly' },
  { path: '/Fellowship', priority: 0.7, changefreq: 'monthly' },
  { path: '/WhyJoinUs', priority: 0.8, changefreq: 'monthly' },
  { path: '/JoinUs', priority: 0.8, changefreq: 'monthly' },
  { path: '/RegisteredOrganisation', priority: 0.7, changefreq: 'monthly' },
  { path: '/CPDTrainingMarketing', priority: 0.8, changefreq: 'weekly' },
  { path: '/IntroductoryCourses', priority: 0.7, changefreq: 'weekly' },
  { path: '/AdvancedCourses', priority: 0.7, changefreq: 'weekly' },
  { path: '/RefresherCourses', priority: 0.7, changefreq: 'weekly' },
  { path: '/SpecialistCourses', priority: 0.7, changefreq: 'weekly' },
  { path: '/Conferences', priority: 0.7, changefreq: 'weekly' },
  { path: '/ForumsAndWorkshops', priority: 0.7, changefreq: 'weekly' },
  { path: '/JobsBoardMarketing', priority: 0.8, changefreq: 'daily' },
  { path: '/SupervisionServicesMarketing', priority: 0.7, changefreq: 'monthly' },
  { path: '/SignpostingService', priority: 0.6, changefreq: 'monthly' },
  { path: '/Team', priority: 0.6, changefreq: 'monthly' },
  { path: '/Governance', priority: 0.5, changefreq: 'monthly' },
  { path: '/IfSBoard', priority: 0.5, changefreq: 'monthly' },
  { path: '/ArticlesOfAssociation', priority: 0.4, changefreq: 'yearly' },
  { path: '/ResearchAndAdvocacy', priority: 0.6, changefreq: 'monthly' },
  { path: '/PrivacyPolicy', priority: 0.3, changefreq: 'yearly' },
  { path: '/TermsAndConditions', priority: 0.3, changefreq: 'yearly' },
  { path: '/CookiePolicy', priority: 0.3, changefreq: 'yearly' },
  { path: '/VerifyCredential', priority: 0.5, changefreq: 'monthly' },
  { path: '/Sitemap', priority: 0.3, changefreq: 'weekly' },
];

function generateJobSlug(job) {
  const title = job.title || '';
  const company = job.company_name || '';
  const id = job.id || '';

  const slugPart = `${title}-${company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  return `${slugPart}-${id.slice(0, 8)}`;
}

async function fetchActiveJobs() {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, company_name, application_deadline, updated_at')
    .or(`application_deadline.is.null,application_deadline.gte.${today}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return (data || []).map((job) => ({
    path: `/job/${generateJobSlug(job)}`,
    priority: 0.7,
    changefreq: 'weekly',
    lastmod: job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : undefined,
  }));
}

async function fetchUpcomingEvents() {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('events')
    .select('id, date, updated_at')
    .gte('date', today)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return (data || []).map((event) => ({
    path: `/EventDetails?id=${event.id}`,
    priority: 0.7,
    changefreq: 'weekly',
    lastmod: event.updated_at ? new Date(event.updated_at).toISOString().split('T')[0] : undefined,
  }));
}

async function fetchUpcomingCommunityEvents() {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('community_events')
    .select('id, date, updated_at, status')
    .eq('status', 'Active')
    .gte('date', today)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching community events:', error);
    return [];
  }

  return (data || []).map((event) => ({
    path: `/EventDetails?id=${event.id}&type=community`,
    priority: 0.6,
    changefreq: 'weekly',
    lastmod: event.updated_at ? new Date(event.updated_at).toISOString().split('T')[0] : undefined,
  }));
}

async function fetchAvailableCourses() {
  const today = new Date().toISOString().split('T')[0];

  const { data: courseDates, error: datesError } = await supabase
    .from('course_dates')
    .select('course_id, date, updated_at')
    .eq('status', 'Available')
    .gte('date', today)
    .order('date', { ascending: true });

  if (datesError) {
    console.error('Error fetching course dates:', datesError);
    return [];
  }

  const uniqueCourseIds = [...new Set((courseDates || []).map((cd) => cd.course_id))];

  if (uniqueCourseIds.length === 0) {
    return [];
  }

  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, updated_at')
    .in('id', uniqueCourseIds);

  if (coursesError) {
    console.error('Error fetching courses:', coursesError);
    return [];
  }

  return (courses || []).map((course) => ({
    path: `/TrainingCourseDetails?id=${course.id}`,
    priority: 0.7,
    changefreq: 'weekly',
    lastmod: course.updated_at ? new Date(course.updated_at).toISOString().split('T')[0] : undefined,
  }));
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSitemapXml(urls) {
  const today = new Date().toISOString().split('T')[0];

  const urlEntries = urls
    .map((url) => {
      const loc = `${SITE_URL}${url.path}`;
      const lastmod = url.lastmod || today;
      const changefreq = url.changefreq || 'weekly';
      const priority = url.priority || 0.5;

      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

export default async function handler(req, res) {
  try {
    // Fetch all dynamic content in parallel
    const [jobs, events, communityEvents, courses] = await Promise.all([
      fetchActiveJobs(),
      fetchUpcomingEvents(),
      fetchUpcomingCommunityEvents(),
      fetchAvailableCourses(),
    ]);

    // Combine all URLs
    const allUrls = [...staticRoutes, ...jobs, ...events, ...communityEvents, ...courses];

    // Generate XML
    const sitemapXml = generateSitemapXml(allUrls);

    // Set headers for XML response with caching (5 minutes)
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    return res.status(200).send(sitemapXml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return res.status(500).send('Error generating sitemap');
  }
}
