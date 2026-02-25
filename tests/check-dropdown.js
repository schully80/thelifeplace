#!/usr/bin/env node
import { chromium } from 'playwright';

(async () => {
  const server = process.env.TEST_SERVER || 'http://localhost:4322';
  const path = '/visit/';
  const url = server + path;

  const viewports = [
    { name: 'mobile-iphone', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
  ];

  const browser = await chromium.launch({
    // CI/sandbox friendly flags
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    // allow inline scripts to run
    await page.waitForTimeout(500);

    // ensure toggle exists
    const toggle = await page.$('#mapsDropdownBtn');
    if (!toggle) {
      results.push({ viewport: vp.name, ok: false, reason: 'toggle-missing' });
      continue;
    }

    // click toggle
    await toggle.click();
    // wait for menu to expand (max-height transition)
    await page.waitForTimeout(400);

    const menu = await page.$('#mapsDropdownMenu');
    if (!menu) {
      results.push({ viewport: vp.name, ok: false, reason: 'menu-missing' });
      continue;
    }

    const visible = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { ok: false, reason: 'not-found' };
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const elAtPoint = document.elementFromPoint(centerX, Math.max(0, Math.min(window.innerHeight - 1, centerY)));

      const isVisible = !!(rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && parseFloat(style.opacity || '1') > 0);

      // check that element or its ancestor is the element at center point (not covered by form/map)
      let covers = false;
      if (elAtPoint) {
        covers = el.contains(elAtPoint) || elAtPoint.contains(el);
      }

      const offscreen = rect.bottom < 0 || rect.top > window.innerHeight;

      return { ok: isVisible && covers && !offscreen, rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }, isVisible, covers, offscreen };
    }, '#mapsDropdownMenu');

    results.push({ viewport: vp.name, ok: !!visible.ok, details: visible });

    // close menu
    await toggle.click();
    await page.waitForTimeout(150);
  }

  await browser.close();

  const failures = results.filter(r => !r.ok);
  console.log(JSON.stringify({ url, results }, null, 2));
  if (failures.length) {
    console.error('Dropdown visibility failures detected');
    process.exit(2);
  }
  console.log('All viewport checks passed');
  process.exit(0);
})();
