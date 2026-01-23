const SITE_URL = process.env.VITE_MAIN_SITE_URL || 'https://www.join-ifs.org';

export default function handler(req, res) {
  const robotsTxt = `# robots.txt for Independent Federation for Safeguarding

User-agent: *
Allow: /

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Disallow auth and internal pages
Disallow: /ApplicationPending
Disallow: /MemberAccessRequired
Disallow: /VerifyEmail
Disallow: /EventRegistrationSuccess
Disallow: /MembershipPlans
Disallow: /Onboarding

# Disallow query parameters that create duplicate content
Disallow: /*?*action=
Disallow: /*?*payment=
`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400');

  return res.status(200).send(robotsTxt);
}
