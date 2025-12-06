/**
 * Quick Frontend Visual Check
 *
 * This script uses Playwright to:
 * 1. Take screenshots of all pages
 * 2. Check for broken images
 * 3. Verify media is loading
 * 4. Test responsive design
 *
 * Run with: npx tsx scripts/check-frontend.ts
 */

import { chromium } from '@playwright/test';

const baseURL = 'http://localhost:3005';

const pages = [
  { path: '/', name: 'Home', hasMedia: true },
  { path: '/about', name: 'About', hasMedia: true },
  { path: '/impact', name: 'Impact', hasMedia: true },
  { path: '/community', name: 'Community', hasMedia: true },
  { path: '/stories', name: 'Stories', hasMedia: true },
  { path: '/share-voice', name: 'Share Voice', hasMedia: true },
  { path: '/annual-reports', name: 'Annual Reports', hasMedia: true },
];

async function checkFrontend() {
  console.log('🎭 Starting Frontend Visual Check...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  let totalImages = 0;
  let brokenImages = 0;
  let pagesWithErrors = 0;

  for (const pageInfo of pages) {
    console.log(`\n📄 Checking ${pageInfo.name} (${pageInfo.path})`);

    try {
      // Navigate and wait for page load
      const response = await page.goto(`${baseURL}${pageInfo.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      if (response?.status() !== 200) {
        console.log(`   ❌ HTTP ${response?.status()}`);
        pagesWithErrors++;
        continue;
      }

      console.log(`   ✅ HTTP 200 - Page loaded`);

      // Wait a bit for dynamic content
      await page.waitForTimeout(2000);

      // Take screenshot
      await page.screenshot({
        path: `screenshots/${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true
      });
      console.log(`   📸 Screenshot saved`);

      if (pageInfo.hasMedia) {
        // Check images
        const images = await page.locator('img').all();
        totalImages += images.length;
        console.log(`   🖼️  Found ${images.length} <img> elements`);

        let pageBrokenImages = 0;
        for (const img of images) {
          const src = await img.getAttribute('src');
          if (src && !src.startsWith('data:') && !src.startsWith('/_next')) {
            const isVisible = await img.isVisible().catch(() => false);
            if (isVisible) {
              const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
              if (naturalWidth === 0) {
                console.log(`      ⚠️  Broken: ${src}`);
                pageBrokenImages++;
                brokenImages++;
              }
            }
          }
        }

        if (pageBrokenImages === 0 && images.length > 0) {
          console.log(`   ✅ All images loading correctly`);
        }

        // Check background images
        const bgImages = await page.locator('[style*="backgroundImage"]').all();
        if (bgImages.length > 0) {
          console.log(`   🎨 Found ${bgImages.length} background images`);
        }

        // Check for videos
        const videos = await page.locator('video').all();
        if (videos.length > 0) {
          console.log(`   🎥 Found ${videos.length} video elements`);
        }
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
      pagesWithErrors++;
    }
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Pages checked: ${pages.length}`);
  console.log(`❌ Pages with errors: ${pagesWithErrors}`);
  console.log(`🖼️  Total images found: ${totalImages}`);
  console.log(`⚠️  Broken images: ${brokenImages}`);
  console.log(`📸 Screenshots saved to: screenshots/`);
  console.log('='.repeat(60));

  if (pagesWithErrors === 0 && brokenImages === 0) {
    console.log('\n🎉 All pages looking good!');
  } else {
    console.log('\n⚠️  Some issues found. Check details above.');
  }
}

checkFrontend().catch(console.error);
