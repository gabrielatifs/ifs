/**
 * Vercel Edge Middleware for Dynamic SEO
 *
 * This middleware intercepts requests for dynamic routes (/job/:slug, /course/:slug, /event/:id)
 * and serves pre-rendered HTML with correct meta tags for social crawlers.
 *
 * For regular users, it passes through to the SPA as normal.
 */

export const config = {
  matcher: ['/job/:slug*', '/course/:slug*', '/event/:path*', '/join/:slug*'],
};

// Social media and search engine bot user agents
const BOT_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Pinterest',
  'Googlebot',
  'bingbot',
  'Baiduspider',
  'yandex',
  'DuckDuckBot',
  'Applebot',
];

/**
 * Check if request is from a social crawler or search bot
 */
function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot.toLowerCase()));
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const { pathname, search } = url;
  const userAgent = request.headers.get('user-agent') || '';

  // Only intercept for crawlers
  if (!isCrawler(userAgent)) {
    // Pass through to normal SPA handling
    return undefined;
  }

  // Build the render API URL
  const renderUrl = new URL('/api/render', request.url);
  renderUrl.searchParams.set('path', pathname);

  // Preserve any existing query params (like ?id= or ?type=)
  if (search) {
    const searchParams = new URLSearchParams(search);
    searchParams.forEach((value, key) => {
      if (key !== 'path') {
        renderUrl.searchParams.set(key, value);
      }
    });
  }

  try {
    // Fetch the rendered HTML from our API
    const response = await fetch(renderUrl.toString(), {
      headers: {
        'User-Agent': userAgent,
      },
    });

    if (response.ok) {
      const html = await response.text();
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate',
        },
      });
    }
  } catch (error) {
    console.error('Middleware fetch error:', error);
  }

  // Fall through to normal handling if render API fails
  return undefined;
}
