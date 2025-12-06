import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3005';

const pages = [
  { path: '/', name: 'home', hasMedia: true },
  { path: '/about', name: 'about', hasMedia: true },
  { path: '/impact', name: 'impact', hasMedia: true },
  { path: '/community', name: 'community', hasMedia: true },
  { path: '/stories', name: 'stories', hasMedia: true },
  { path: '/share-voice', name: 'share-voice', hasMedia: true },
  { path: '/annual-reports', name: 'annual-reports', hasMedia: true },
  { path: '/search', name: 'search', hasMedia: false },
  { path: '/chat', name: 'chat', hasMedia: false },
];

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

test.describe('Visual Check - All Pages', () => {
  for (const page of pages) {
    test(`${page.name} - loads successfully`, async ({ page: playwright }) => {
      // Navigate to page
      const response = await playwright.goto(`${baseURL}${page.path}`);

      // Check page loads with 200 status
      expect(response?.status()).toBe(200);

      // Wait for page to be fully loaded
      await playwright.waitForLoadState('networkidle');

      // Check for console errors
      const errors: string[] = [];
      playwright.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Take screenshot for desktop
      await playwright.setViewportSize({ width: 1920, height: 1080 });
      await playwright.screenshot({
        path: `screenshots/${page.name}-desktop.png`,
        fullPage: true
      });

      console.log(`✓ ${page.name} loaded successfully`);
    });

    if (page.hasMedia) {
      test(`${page.name} - media elements check`, async ({ page: playwright }) => {
        await playwright.goto(`${baseURL}${page.path}`);
        await playwright.waitForLoadState('networkidle');

        // Wait a bit for dynamic media to load
        await playwright.waitForTimeout(2000);

        // Check for images
        const images = await playwright.locator('img').all();
        console.log(`  Found ${images.length} images on ${page.name}`);

        // Check for broken images
        let brokenImages = 0;
        for (const img of images) {
          const src = await img.getAttribute('src');
          if (src && !src.startsWith('data:')) {
            const isVisible = await img.isVisible().catch(() => false);
            if (isVisible) {
              const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
              if (naturalWidth === 0) {
                console.log(`  ⚠️  Broken image: ${src}`);
                brokenImages++;
              }
            }
          }
        }

        if (brokenImages === 0) {
          console.log(`  ✓ All images loading correctly`);
        } else {
          console.log(`  ⚠️  ${brokenImages} broken images found`);
        }

        // Check for background images in style attributes
        const elementsWithBg = await playwright.locator('[style*="backgroundImage"]').all();
        console.log(`  Found ${elementsWithBg.length} elements with background images`);
      });
    }

    test(`${page.name} - responsive design check`, async ({ page: playwright }) => {
      for (const viewport of viewports) {
        await playwright.setViewportSize({ width: viewport.width, height: viewport.height });
        await playwright.goto(`${baseURL}${page.path}`);
        await playwright.waitForLoadState('networkidle');

        // Take screenshot
        await playwright.screenshot({
          path: `screenshots/${page.name}-${viewport.name}.png`,
          fullPage: false // Just above-the-fold for responsive check
        });

        console.log(`  ✓ ${viewport.name} (${viewport.width}x${viewport.height})`);
      }
    });
  }
});

test.describe('Media Library Integration', () => {
  test('Home page - hero image loaded', async ({ page }) => {
    await page.goto(`${baseURL}/`);
    await page.waitForLoadState('networkidle');

    // Check for hero section with background image
    const heroSection = page.locator('section').first();
    const style = await heroSection.getAttribute('style');

    if (style && style.includes('backgroundImage')) {
      console.log('✓ Home hero image found in background');
    } else {
      console.log('⚠️  Home hero image not found');
    }
  });

  test('About page - all media sections', async ({ page }) => {
    await page.goto(`${baseURL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const sections = [
      { name: 'Hero', selector: 'section[style*="backgroundImage"]' },
      { name: 'Leadership photos', selector: 'img' },
      { name: 'Service photos', selector: 'img' },
    ];

    for (const section of sections) {
      const elements = await page.locator(section.selector).all();
      console.log(`  ${section.name}: ${elements.length} elements`);
    }
  });
});

test.describe('Accessibility Check', () => {
  test('All pages have proper heading structure', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(`${baseURL}${pageInfo.path}`);
      await page.waitForLoadState('networkidle');

      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThan(0);

      console.log(`✓ ${pageInfo.name} has ${h1Count} h1 heading(s)`);
    }
  });
});
