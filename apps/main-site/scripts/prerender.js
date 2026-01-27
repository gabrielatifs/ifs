#!/usr/bin/env node
/**
 * Prerender Script for Static Marketing Pages
 *
 * This script pre-renders static marketing pages at build time to ensure
 * the HTML contains correct meta tags for SEO and social sharing.
 *
 * How it works:
 * 1. Starts a local server serving the built dist files
 * 2. Uses Puppeteer to render each static route
 * 3. Waits for react-helmet-async to update the <head>
 * 4. Saves the rendered HTML to dist folder
 *
 * Run: npm run prerender (after vite build)
 */

import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '..', 'dist');
const PORT = 4173;

// Static routes to pre-render (from SEOManager pageSEO config)
// Includes both PascalCase and lowercase/kebab-case aliases so that
// Vercel's case-sensitive filesystem serves pre-rendered HTML for all URL variants.
const STATIC_ROUTES = [
  '/',
  '/About',
  '/about',
  '/Contact',
  '/contact',
  '/Events',
  '/events',
  '/Conferences',
  '/conferences',
  '/ForumsAndWorkshops',
  '/forums-and-workshops',
  '/Training',
  '/courses',
  '/CPDTrainingMarketing',
  '/training',
  '/IntroductoryCourses',
  '/introductory-courses',
  '/AdvancedCourses',
  '/advanced-courses',
  '/RefresherCourses',
  '/refresher-courses',
  '/SpecialistCourses',
  '/specialist-courses',
  '/job',
  '/Jobs',
  '/join',
  '/JobsBoardMarketing',
  '/WhyJoinUs',
  '/why-join-us',
  '/Membership',
  '/membership',
  '/MembershipTiers',
  '/membership-tiers',
  '/MembershipPlans',
  '/membership-plans',
  '/MemberBenefits',
  '/member-benefits',
  '/AssociateMembership',
  '/associate-membership',
  '/FullMembership',
  '/full-membership',
  '/Fellowship',
  '/fellowship',
  '/JoinUs',
  '/joinus',
  '/SupervisionServicesMarketing',
  '/supervision',
  '/SignpostingService',
  '/signposting',
  '/ResearchAndAdvocacy',
  '/research',
  '/Team',
  '/team',
  '/Governance',
  '/governance',
  '/IfSBoard',
  '/board',
  '/ArticlesOfAssociation',
  '/articles-of-association',
  '/PrivacyPolicy',
  '/privacy-policy',
  '/TermsAndConditions',
  '/terms',
  '/CookiePolicy',
  '/cookie-policy',
  '/Sitemap',
  '/sitemap',
  '/VerifyCredential',
  '/verify',
  '/RegisteredOrganisation',
  '/registered-organisation',
];

/**
 * Simple static file server
 */
function createStaticServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };

  return createServer((req, res) => {
    let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

    // For SPA routes, serve index.html
    if (!existsSync(filePath) || !filePath.includes('.')) {
      filePath = join(DIST_DIR, 'index.html');
    }

    try {
      const content = readFileSync(filePath);
      const ext = filePath.substring(filePath.lastIndexOf('.'));
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content);
    } catch (err) {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

/**
 * Render a single route and return the HTML
 */
async function renderRoute(browser, route) {
  const page = await browser.newPage();

  try {
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for Helmet to update the head (react-helmet-async)
    await page.waitForFunction(
      () => {
        const title = document.querySelector('title');
        // Wait until title is not the default
        return title && title.textContent && !title.textContent.includes('React App');
      },
      { timeout: 10000 }
    ).catch(() => {
      // Continue even if timeout - page may have custom title logic
    });

    // Additional wait for any async meta updates
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get the full HTML including updated head
    const html = await page.content();

    return html;
  } finally {
    await page.close();
  }
}

/**
 * Save rendered HTML to dist folder
 */
function saveRenderedHtml(route, html) {
  // Determine file path
  let filePath;
  if (route === '/') {
    filePath = join(DIST_DIR, 'index.html');
  } else {
    // Create directory structure for clean URLs
    const dirPath = join(DIST_DIR, route);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
    filePath = join(dirPath, 'index.html');
  }

  writeFileSync(filePath, html, 'utf-8');
  return filePath;
}

/**
 * Main prerender function
 */
async function prerender() {
  console.log('🚀 Starting pre-render process...\n');

  // Check if dist folder exists
  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist folder not found. Run "vite build" first.');
    process.exit(1);
  }

  // Start local server
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`📡 Local server running on http://localhost:${PORT}\n`);

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  console.log(`📄 Pre-rendering ${STATIC_ROUTES.length} static routes...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const route of STATIC_ROUTES) {
    try {
      process.stdout.write(`  Rendering ${route}...`);
      const html = await renderRoute(browser, route);
      const filePath = saveRenderedHtml(route, html);
      console.log(` ✓`);
      successCount++;
    } catch (error) {
      console.log(` ✗ ${error.message}`);
      errorCount++;
    }
  }

  // Cleanup
  await browser.close();
  server.close();

  console.log(`\n✨ Pre-render complete!`);
  console.log(`   ✓ ${successCount} pages rendered successfully`);
  if (errorCount > 0) {
    console.log(`   ✗ ${errorCount} pages failed`);
  }
}

prerender().catch((error) => {
  // If Puppeteer/Chrome can't launch (e.g. missing system libraries on Vercel),
  // exit gracefully. The edge middleware + render API handle crawler SEO as a fallback.
  if (error.message && (error.message.includes('Failed to launch the browser process') || error.message.includes('Could not find Chrome'))) {
    console.warn('⚠️  Pre-render skipped: Chrome not available in this environment.');
    console.warn('   Crawler SEO is still handled by edge middleware + /api/render.');
    process.exit(0);
  }
  console.error('Pre-render failed:', error);
  process.exit(1);
});
