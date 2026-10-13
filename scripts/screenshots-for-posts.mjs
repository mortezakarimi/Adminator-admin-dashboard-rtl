#!/usr/bin/env node
/**
 * Captures the dashboard at the exact dimensions used by each external post
 * (Colorlib + AdminLTE). One file per post, light/dark per the post's theme.
 *
 * Output → screenshots/posts/<filename> for human review before upload.
 *
 * Usage:
 *   1. In one terminal: npm start          (dev server on http://localhost:4000)
 *   2. In another:      node scripts/screenshots-for-posts.mjs
 *
 * Then review the files; if all look good, run publish-post-screenshots.mjs.
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'screenshots', 'posts');
const BASE = process.env.BASE_URL || 'http://localhost:4000';

mkdirSync(OUT, { recursive: true });

// One entry per external post. `viewport` and `scale` chosen to land on the
// existing image's exact pixel dimensions so the swap is 1:1.
const SHOTS = [
  {
    file: 'adminator-2026-dashboard-light-1200.jpg',
    page: '/index.html',
    viewport: { width: 1200, height: 976 },
    scale: 1,
    dark: false,
    type: 'jpeg',
    quality: 88,
    note: 'Colorlib #34814 — replaces adminator-free-admin-dashboard-template.jpg (1200×976)',
  },
  {
    file: 'adminator-2026-dashboard-dark-1200.jpg',
    page: '/index.html',
    viewport: { width: 1200, height: 972 },
    scale: 1,
    dark: true,
    type: 'jpeg',
    quality: 88,
    note: 'Colorlib #374836 — replaces master-adminator-2026.jpg (1200×972, dark)',
  },
  {
    file: 'adminator-2026-dashboard-light-1200x800.png',
    page: '/index.html',
    viewport: { width: 1200, height: 800 },
    scale: 1,
    dark: false,
    type: 'png',
    note: 'AdminLTE #320 — replaces adminator-2025.png (1200×800)',
  },
  {
    file: 'adminator-2026-dashboard-light-1280x945.png',
    page: '/index.html',
    // Capture above the 1100px breakpoint so the full sidebar (with labels)
    // stays visible. WordPress will auto-generate a 1024×756 variant on upload.
    viewport: { width: 1280, height: 945 },
    scale: 1,
    dark: false,
    type: 'png',
    note: 'AdminLTE #1643 — replaces adminator-html-admin-template-1024x756.png (uploaded at 1280×945, WP serves a 1024×756 variant)',
  },
  {
    file: 'adminator-2026-dashboard-dark-2560.png',
    page: '/index.html',
    // Capture at 1280×892 with 2× scale → 2560×1784 (target was 2560×1783)
    viewport: { width: 1280, height: 892 },
    scale: 2,
    dark: true,
    type: 'png',
    note: 'AdminLTE #1396 — replaces adminator-dark-bootstrap-admin-dashboard-scaled.png (2560×1783, dark)',
  },
  {
    file: 'adminator-2026-signin-1920x1200.jpg',
    page: '/signin.html',
    viewport: { width: 1920, height: 1200 },
    scale: 1,
    dark: false,
    type: 'jpeg',
    quality: 88,
    note: 'AdminLTE #989 — new sign-in form for Bootstrap Login Forms post (1920×1200)',
  },
];

async function capture(browser, shot) {
  const ctx = await browser.newContext({
    viewport: shot.viewport,
    deviceScaleFactor: shot.scale,
    colorScheme: shot.dark ? 'dark' : 'light',
  });
  const page = await ctx.newPage();

  // Set the theme cookie/localStorage so the early-paint script picks it up
  // before any pixels render.
  await page.addInitScript((theme) => {
    try { localStorage.setItem('dash26-theme', theme); } catch { /* localStorage unavailable */ }
  }, shot.dark ? 'dark' : 'light');

  const url = BASE + shot.page;
  process.stdout.write(`  → ${shot.file} (${shot.viewport.width}×${shot.viewport.height} @${shot.scale}x${shot.dark ? ', dark' : ''}) ... `);

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  // Settle entry animations + chart/calendar/map renders.
  await page.waitForTimeout(1500);

  const path = resolve(OUT, shot.file);
  await page.screenshot({
    path,
    fullPage: false,
    type: shot.type,
    ...(shot.type === 'jpeg' ? { quality: shot.quality } : {}),
  });
  console.log('saved');

  await ctx.close();
}

(async () => {
  console.log(`Capturing post-specific screenshots from ${BASE}`);
  console.log(`Output: ${OUT}\n`);

  const browser = await chromium.launch();
  try {
    for (const shot of SHOTS) await capture(browser, shot);
  } finally {
    await browser.close();
  }

  console.log(`\n${SHOTS.length} screenshots written. Notes:\n`);
  for (const s of SHOTS) console.log('  ' + s.file + '\n     ' + s.note);
})();
