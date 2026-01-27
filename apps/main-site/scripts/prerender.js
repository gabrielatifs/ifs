#!/usr/bin/env node
/**
 * Prerender Script for Static Marketing Pages
 *
 * Replaces default meta tags in the built index.html with page-specific
 * SEO tags from the shared config. No browser needed — works everywhere
 * including Vercel's build environment.
 *
 * Run: npm run prerender (after vite build)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  pageSEO,
  pathToPageName,
  BASE_URL,
  DEFAULT_OG_IMAGE,
  ORGANIZATION_JSONLD,
  WEBSITE_JSONLD,
  buildBreadcrumbJsonLd,
} from '../src/seo-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '..', 'dist');

// All static routes to pre-render (every path alias from pathToPageName
// that maps to a page with SEO config).
const STATIC_ROUTES = Object.keys(pathToPageName).filter((path) => {
  const pageName = pathToPageName[path];
  return pageSEO[pageName] != null;
});

/**
 * Escape a string for safe use inside an HTML attribute value (double-quoted).
 */
function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Take the built index.html template and replace the default meta tags
 * with page-specific values from pageSEO.
 */
function renderRoute(templateHtml, route) {
  const pageName = pathToPageName[route];
  const seo = pageSEO[pageName];
  if (!seo) return null;

  const canonicalUrl = `${BASE_URL}${seo.canonical}`;
  const ogTitle = seo.ogTitle || seo.title;
  const ogDesc = seo.ogDescription || seo.description;
  const ogImage = seo.ogImage || DEFAULT_OG_IMAGE;

  let html = templateHtml;

  // Title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeAttr(seo.title)}</title>`
  );

  // Meta description
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeAttr(seo.description)}" />`
  );

  // Canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // hreflang
  html = html.replace(
    /<link rel="alternate" hreflang="en-gb" href="[^"]*" \/>/,
    `<link rel="alternate" hreflang="en-gb" href="${canonicalUrl}" />`
  );

  // Open Graph
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeAttr(ogTitle)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeAttr(ogDesc)}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${ogImage}" />`
  );

  // Twitter Card
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapeAttr(ogTitle)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escapeAttr(ogDesc)}" />`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${ogImage}" />`
  );

  // Robots — switch to noindex if the page config says so
  if (seo.noindex) {
    html = html.replace(
      /<meta name="robots" content="[^"]*" \/>/,
      `<meta name="robots" content="noindex, nofollow" />`
    );
  }

  // Structured Data — inject Organization + WebSite (homepage) + Breadcrumb JSON-LD before </head>
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(pageName);
  let structuredDataTags = `\n    <script type="application/ld+json">${JSON.stringify(ORGANIZATION_JSONLD)}</script>`;
  if (pageName === 'Home') {
    structuredDataTags += `\n    <script type="application/ld+json">${JSON.stringify(WEBSITE_JSONLD)}</script>`;
  }
  if (breadcrumbJsonLd) {
    structuredDataTags += `\n    <script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>`;
  }
  html = html.replace('</head>', `${structuredDataTags}\n  </head>`);

  return html;
}

/**
 * Save rendered HTML to dist folder
 */
function saveRenderedHtml(route, html) {
  let filePath;
  if (route === '/') {
    filePath = join(DIST_DIR, 'index.html');
  } else {
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
function prerender() {
  console.log('Starting pre-render process...\n');

  if (!existsSync(DIST_DIR)) {
    console.error('dist folder not found. Run "vite build" first.');
    process.exit(1);
  }

  const templatePath = join(DIST_DIR, 'index.html');
  if (!existsSync(templatePath)) {
    console.error('dist/index.html not found. Run "vite build" first.');
    process.exit(1);
  }

  const templateHtml = readFileSync(templatePath, 'utf-8');

  console.log(`Pre-rendering ${STATIC_ROUTES.length} static routes...\n`);

  let successCount = 0;
  let skipCount = 0;

  for (const route of STATIC_ROUTES) {
    const html = renderRoute(templateHtml, route);
    if (!html) {
      console.log(`  Skipping ${route} (no SEO config)`);
      skipCount++;
      continue;
    }
    saveRenderedHtml(route, html);
    console.log(`  ${route} -> OK`);
    successCount++;
  }

  console.log(`\nPre-render complete!`);
  console.log(`  ${successCount} pages rendered`);
  if (skipCount > 0) {
    console.log(`  ${skipCount} pages skipped`);
  }
}

prerender();
