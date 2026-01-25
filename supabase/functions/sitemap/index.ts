import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
};

const getEnv = (key: string, fallback?: string) => {
  const value = Deno.env.get(key);
  if (value && value.trim()) {
    return value.trim();
  }
  return fallback;
};

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const resolveBaseUrl = (req: Request) => {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";

  if (host) {
    return normalizeBaseUrl(`${proto}://${host}`);
  }

  const envUrl = getEnv("MAIN_SITE_URL") || getEnv("VITE_MAIN_SITE_URL");
  if (envUrl) {
    return normalizeBaseUrl(envUrl);
  }

  return "https://www.join-ifs.org";
};

const parseDate = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const toIsoDate = (value: unknown) => {
  const date = parseDate(value);
  if (!date) return null;
  return date.toISOString().split("T")[0];
};

const isOnOrAfter = (value: unknown, comparison: Date) => {
  const date = parseDate(value);
  if (!date) return false;
  return date >= comparison;
};

const slugify = (text: unknown) => {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const generateJobSlug = (job: Record<string, unknown>) => {
  const title = slugify(job.title);
  const location = slugify(job.address_locality || job.location);
  const company = slugify(job.company_name || job.organisation);
  return [title, location, company].filter(Boolean).join("-");
};

const uniqueBy = <T>(items: T[], key: (item: T) => string) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = key(item);
    if (!id || seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
};

const fetchAll = async <T>(supabase: ReturnType<typeof createClient>, table: string, columns: string) => {
  const pageSize = 1000;
  let from = 0;
  const results: T[] = [];

  while (true) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + pageSize - 1);
    if (error) {
      throw new Error(`Failed to fetch ${table}: ${error.message}`);
    }
    const page = (data as T[]) || [];
    results.push(...page);
    if (page.length < pageSize) {
      break;
    }
    from += pageSize;
  }

  return results;
};

const pickLatestDate = (...values: Array<unknown>) => {
  const dates = values.map(parseDate).filter((value): value is Date => Boolean(value));
  if (!dates.length) return null;
  const latest = dates.reduce((max, current) => (current > max ? current : max));
  return latest.toISOString().split("T")[0];
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!["GET", "HEAD"].includes(req.method)) {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseUrl = getEnv("SUPABASE_URL");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response("Missing Supabase configuration", { status: 500, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseUrl = resolveBaseUrl(req);

    const [events, jobs, courseDates, courses] = await Promise.all([
      fetchAll<{ id: string; date?: string; updated_at?: string }>(
        supabase,
        "events",
        "id,date,updated_at",
      ),
      fetchAll<{
        id: string;
        title?: string;
        company_name?: string;
        organisation?: string;
        location?: string;
        address_locality?: string;
        status?: string;
        application_deadline?: string;
        updated_at?: string;
      }>(supabase, "jobs", "id,title,company_name,organisation,location,address_locality,status,application_deadline,updated_at"),
      fetchAll<{ id: string; course_id?: string; date?: string; end_date?: string; status?: string; updated_at?: string }>(
        supabase,
        "course_dates",
        "id,course_id,date,end_date,status,updated_at",
      ),
      fetchAll<{ id: string; updated_at?: string }>(supabase, "courses", "id,updated_at"),
    ]);

    const eventUrls = events
      .filter((event) => isOnOrAfter(event.date, today))
      .map((event) => ({
        loc: `${baseUrl}/eventdetails?id=${encodeURIComponent(event.id)}`,
        lastmod: pickLatestDate(event.updated_at, event.date),
      }));

    const activeJobs = jobs.filter((job) => {
      const status = String(job.status || "").toLowerCase();
      if (status !== "active") {
        return false;
      }
      if (!job.application_deadline) {
        return true;
      }
      return isOnOrAfter(job.application_deadline, today);
    });

    const jobUrls = activeJobs.map((job) => {
      const slug = generateJobSlug(job);
      const path = slug ? `/job/${slug}` : `/jobdetailspublic?id=${encodeURIComponent(job.id)}`;
      return {
        loc: `${baseUrl}${path}`,
        lastmod: pickLatestDate(job.updated_at, job.application_deadline),
      };
    });

    const activeCourseDates = courseDates.filter((date) => {
      const status = String(date.status || "").toLowerCase();
      if (!["available", "active"].includes(status)) {
        return false;
      }
      return isOnOrAfter(date.date, today);
    });

    const latestCourseDateByCourse = new Map<string, string>();
    for (const date of activeCourseDates) {
      if (!date.course_id) continue;
      const latest = pickLatestDate(date.date, date.end_date, date.updated_at);
      const existing = latestCourseDateByCourse.get(date.course_id);
      if (!existing || (latest && latest > existing)) {
        latestCourseDateByCourse.set(date.course_id, latest || existing || "");
      }
    }

    const courseUrls = courses
      .filter((course) => latestCourseDateByCourse.has(course.id))
      .map((course) => {
        const latestDate = latestCourseDateByCourse.get(course.id);
        return {
          loc: `${baseUrl}/trainingcoursedetails?id=${encodeURIComponent(course.id)}`,
          lastmod: pickLatestDate(course.updated_at, latestDate),
        };
      });

    const allUrls = uniqueBy([...eventUrls, ...courseUrls, ...jobUrls], (item) => item.loc).filter((item) => item.loc);

    const xmlLines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...allUrls.map((item) => {
        const lastmod = item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : "";
        return `  <url><loc>${item.loc}</loc>${lastmod}</url>`;
      }),
      "</urlset>",
    ];

    const body = xmlLines.join("\n");

    const headers = {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    };

    if (req.method === "HEAD") {
      return new Response(null, { headers });
    }

    return new Response(body, { headers });
  } catch (error) {
    return new Response("Failed to generate sitemap", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
