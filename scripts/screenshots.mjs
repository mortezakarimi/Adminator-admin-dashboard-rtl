#!/usr/bin/env node
/**
 * Captures the README screenshots.
 *
 * Usage:
 *   1. In one terminal: npm start    (must be running on http://localhost:4000)
 *   2. In another:      npm run screenshots
 *
 * Images land in ./screenshots/ named adminator-2026-<slug>(-dark).png.
 * Run after a fresh build or any visual change so the README stays current.
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'screenshots');
const BASE = process.env.BASE_URL || 'http://localhost:4000';

mkdirSync(OUT, { recursive: true });

// Each entry → one screenshot. `dark: true` flips data-theme before capture.
const SHOTS = [
  { slug: 'dashboard-light', path: '/index.html',     viewport: { width: 1440, height: 900 } },
  { slug: 'dashboard-dark',  path: '/index.html',     viewport: { width: 1440, height: 900 }, dark: true },
  { slug: 'email',           path: '/email.html',     viewport: { width: 1440, height: 900 } },
  { slug: 'calendar',        path: '/calendar.html',  viewport: { width: 1440, height: 900 } },
  { slug: 'charts',          path: '/charts.html',    viewport: { width: 1440, height: 900 } },
  { slug: 'forms',           path: '/forms.html',     viewport: { width: 1440, height: 900 } },
  { slug: 'datatable',       path: '/datatable.html', viewport: { width: 1440, height: 900 } },
  { slug: 'signin',          path: '/signin.html',    viewport: { width: 1440, height: 900 } },
];

async function capture(browser, shot) {
  const ctx = await browser.newContext({
    viewport: shot.viewport,
    deviceScaleFactor: 2, // retina-quality
    colorScheme: shot.dark ? 'dark' : 'light',
  });
  const page = await ctx.newPage();

  // Pre-set the theme cookie/localStorage so the early-paint script picks it up.
  await page.addInitScript((theme) => {
    try { localStorage.setItem('dash26-theme', theme); } catch {}
  }, shot.dark ? 'dark' : 'light');

  const url = BASE + shot.path;
  process.stdout.write(`  → ${url}${shot.dark ? ' (dark)' : ''} ... `);

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  // Let entry animations and chart/calendar/map renders settle.
  await page.waitForTimeout(1500);

  const file = resolve(OUT, `adminator-2026-${shot.slug}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log('saved');

  await ctx.close();
}

(async () => {
  console.log(`Capturing screenshots from ${BASE}`);
  console.log(`Output: ${OUT}\n`);

  const browser = await chromium.launch();
  try {
    for (const shot of SHOTS) await capture(browser, shot);
  } finally {
    await browser.close();
  }
  console.log(`\nDone. ${SHOTS.length} screenshots written.`);
})();
