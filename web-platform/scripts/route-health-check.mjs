#!/usr/bin/env node

/**
 * Route Health Check — hits every public route against a local production build
 * and reports HTTP status, error indicators, and suspiciously small responses.
 *
 * Usage:
 *   npm run build && npm run start &
 *   node scripts/route-health-check.mjs
 *
 * Options:
 *   --base-url=http://localhost:3000  (default)
 *   --concurrency=5                   (default)
 */

const BASE_URL = process.argv.find(a => a.startsWith('--base-url='))?.split('=')[1] || 'http://localhost:3000';
const CONCURRENCY = parseInt(process.argv.find(a => a.startsWith('--concurrency='))?.split('=')[1] || '5', 10);

// All public static routes (no auth required)
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/services',
  '/stories',
  '/storytellers',
  '/impact',
  '/subscribe',
  '/share-story',
  '/share-voice',
  '/voices',
  '/timeline',
  '/road-to-20-years',
  '/search',
  '/login',
  '/signup',
  '/reset-password',
  '/wiki',
  '/wiki/achievements',
  '/wiki/categories',
  '/wiki/culture',
  '/wiki/explore',
  '/wiki/graph',
  '/wiki/history',
  '/wiki/innovation',
  '/wiki/innovation/elders-trip',
  '/wiki/innovation/local-server',
  '/wiki/innovation/photo-studio',
  '/wiki/innovation/storm-recovery',
  '/wiki/people',
  '/wiki/people/add',
  '/wiki/places',
  '/wiki/services',
  '/wiki/stories',
  '/wiki/timeline',
  '/wiki/topics',
  '/thematic-reports',
  '/publications',
  '/explore',
  '/annual-report/live',
];

const ERROR_PATTERNS = [
  'Application error',
  'Internal Server Error',
  'Server Error',
  'Unhandled Runtime Error',
  'hydration mismatch',
  'Minified React error',
  'NEXT_NOT_FOUND',
  'Cannot read properties of',
  'TypeError',
  'ReferenceError',
];

const MIN_RESPONSE_SIZE = 500; // bytes — anything smaller is suspicious

async function checkRoute(route) {
  const url = `${BASE_URL}${route}`;
  const start = Date.now();

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PICC-Health-Check/1.0' },
      redirect: 'follow',
    });
    const elapsed = Date.now() - start;
    const html = await res.text();
    const size = Buffer.byteLength(html, 'utf8');

    const issues = [];

    if (res.status >= 400) {
      issues.push(`HTTP ${res.status}`);
    }

    for (const pattern of ERROR_PATTERNS) {
      if (html.includes(pattern)) {
        issues.push(`Contains "${pattern}"`);
      }
    }

    if (size < MIN_RESPONSE_SIZE && res.status === 200) {
      issues.push(`Suspiciously small (${size} bytes)`);
    }

    return {
      route,
      status: res.status,
      size,
      elapsed,
      pass: issues.length === 0 && res.status < 400,
      issues,
    };
  } catch (err) {
    return {
      route,
      status: 0,
      size: 0,
      elapsed: Date.now() - start,
      pass: false,
      issues: [`Connection failed: ${err.message}`],
    };
  }
}

async function runBatch(routes, concurrency) {
  const results = [];
  for (let i = 0; i < routes.length; i += concurrency) {
    const batch = routes.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(checkRoute));
    results.push(...batchResults);

    // Progress indicator
    const done = Math.min(i + concurrency, routes.length);
    process.stdout.write(`\r  Checked ${done}/${routes.length} routes...`);
  }
  process.stdout.write('\n');
  return results;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function main() {
  console.log(`\n🏥 PICC Route Health Check`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Routes: ${PUBLIC_ROUTES.length}`);
  console.log(`   Concurrency: ${CONCURRENCY}\n`);

  // Check if server is running
  try {
    await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
  } catch {
    console.error(`❌ Cannot connect to ${BASE_URL}`);
    console.error(`   Make sure the server is running: npm run build && npm run start`);
    process.exit(1);
  }

  const results = await runBatch(PUBLIC_ROUTES, CONCURRENCY);

  const passed = results.filter(r => r.pass);
  const failed = results.filter(r => !r.pass);

  // Print failures first
  if (failed.length > 0) {
    console.log(`\n❌ FAILED (${failed.length}):\n`);
    for (const r of failed) {
      console.log(`  ${r.route}`);
      console.log(`    Status: ${r.status} | Size: ${formatSize(r.size)} | Time: ${r.elapsed}ms`);
      for (const issue of r.issues) {
        console.log(`    ⚠️  ${issue}`);
      }
      console.log();
    }
  }

  // Print passes
  console.log(`✅ PASSED (${passed.length}):\n`);
  for (const r of passed) {
    console.log(`  ${r.route} — ${r.status} ${formatSize(r.size)} ${r.elapsed}ms`);
  }

  // Summary
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  Total: ${results.length} | Pass: ${passed.length} | Fail: ${failed.length}`);
  console.log(`${'─'.repeat(50)}\n`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

main();
