#!/usr/bin/env node
/**
 * Publishes the v4.0 screenshots into the live external posts.
 *
 * For each post:
 *   1. Uploads the local screenshot to that site's WordPress media library
 *   2. Replaces the existing Adminator <figure> block with a clean one
 *      pointing at the new media (WP rebuilds srcset/sizes on render)
 *   3. Bumps the post's publish date to "now" so feeds + sitemaps reflect it
 *
 * Defaults to --dry-run. Pass --publish to actually mutate the live sites.
 *
 * Usage:
 *   node scripts/publish-post-screenshots.mjs                  # dry run
 *   node scripts/publish-post-screenshots.mjs --publish        # do it
 *   node scripts/publish-post-screenshots.mjs --post 34814 --publish   # one post
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.join(ROOT, 'screenshots', 'posts');

// ── Auth ──────────────────────────────────────────────────────────────────────
// Colorlib creds come from the tailwind-templates .env (WP_API_USER/PASSWORD).
// AdminLTE creds are the application password used in
// publish-dashboardpack-adminlte.js in that same project.

const TT_ENV = '/Users/silkalns/Fresh Projects/tailwind-templates/.env';
const env = Object.fromEntries(
  fs.readFileSync(TT_ENV, 'utf8').split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const colorlibAuth = 'Basic ' + Buffer.from(env.WP_API_USER + ':' + env.WP_API_PASSWORD).toString('base64');
const adminlteAuth = 'Basic ' + Buffer.from('aigarssilkalns:5iBm 8D0X y3Ha Zner gfKU 7urZ').toString('base64');

// ── Posts to update ──────────────────────────────────────────────────────────

const POSTS = [
  {
    site: 'colorlib.com/wp', id: 34814, base: 'https://colorlib.com/wp', auth: colorlibAuth,
    file: 'adminator-2026-dashboard-light-1200.jpg',
    contentType: 'image/jpeg',
    alt: 'Adminator 2026 — clean minimal Bootstrap-free admin dashboard with light theme',
    title: '35 Best Free Admin Dashboard Templates 2026',
  },
  {
    site: 'colorlib.com/wp', id: 374836, base: 'https://colorlib.com/wp', auth: colorlibAuth,
    file: 'adminator-2026-dashboard-dark-1200.jpg',
    contentType: 'image/jpeg',
    alt: 'Adminator 2026 — token-driven dark mode admin dashboard with Chart.js + FullCalendar',
    title: '20 Best Dark Admin Dashboard Templates 2026',
    // This post embeds the same image twice (Adminator + Sleek Dashboard entries).
    // We only touch the Adminator entry.
  },
  {
    site: 'adminlte.io', id: 320, base: 'https://adminlte.io', auth: adminlteAuth,
    file: 'adminator-2026-dashboard-light-1200x800.png',
    contentType: 'image/png',
    alt: 'Adminator 2026 admin template — vanilla JS dashboard with token-driven design system',
    title: '33 Best Admin Templates For 2026',
  },
  {
    site: 'adminlte.io', id: 1643, base: 'https://adminlte.io', auth: adminlteAuth,
    file: 'adminator-2026-dashboard-light-1280x945.png',
    contentType: 'image/png',
    alt: 'Adminator 2026 free admin panel dashboard — Bootstrap-free, ~700 KB JS',
    title: '38 Best Free Admin Panel Templates 2026',
  },
  {
    site: 'adminlte.io', id: 1396, base: 'https://adminlte.io', auth: adminlteAuth,
    file: 'adminator-2026-dashboard-dark-2560.png',
    contentType: 'image/png',
    alt: 'Adminator 2026 — dark mode Bootstrap-free admin dashboard with real Chart.js charts',
    title: '22 Best Bootstrap Dashboard Examples & Templates 2026',
  },
];

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const PUBLISH = args.includes('--publish');
const ONE = (() => { const i = args.indexOf('--post'); return i >= 0 ? Number(args[i + 1]) : null; })();

// ── Helpers ──────────────────────────────────────────────────────────────────

async function uploadMedia(post) {
  const filePath = path.join(SCREENSHOTS_DIR, post.file);
  if (!fs.existsSync(filePath)) throw new Error(`Local file missing: ${filePath}`);
  const buf = fs.readFileSync(filePath);

  const r = await fetch(post.base + '/wp-json/wp/v2/media', {
    method: 'POST',
    headers: {
      Authorization: post.auth,
      'Content-Type': post.contentType,
      'Content-Disposition': `attachment; filename="${post.file}"`,
    },
    body: buf,
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Upload failed (${r.status}): ${text.slice(0, 200)}`);
  }
  const media = await r.json();
  // Set alt text on the media item
  await fetch(post.base + '/wp-json/wp/v2/media/' + media.id, {
    method: 'POST',
    headers: { Authorization: post.auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ alt_text: post.alt }),
  });
  return media; // { id, source_url, ... }
}

function findAdminatorFigure(content) {
  // Locate the H2/H3 heading containing "Adminator" (case-insensitive).
  const headingRe = /<h([23])[^>]*>([^<]*adminator[^<]*)<\/h\1>/gi;
  const m = headingRe.exec(content);
  if (!m) return null;

  // Search the next ~2500 chars for the first <figure>...</figure> block.
  const after = content.slice(m.index + m[0].length, m.index + m[0].length + 2500);
  const figRe = /<figure\b[^>]*>[\s\S]*?<\/figure>/i;
  const fm = figRe.exec(after);
  if (!fm) return null;

  return {
    headingMatch: m[0],
    headingIndex: m.index,
    figureText: fm[0],
    figureIndex: m.index + m[0].length + fm.index,
  };
}

function buildReplacementFigure(media, alt) {
  // Clean Gutenberg image block — WP regenerates srcset/sizes on render.
  return `<!-- wp:image {"id":${media.id},"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="${media.source_url}" alt="${alt}" class="wp-image-${media.id}"/></figure>
<!-- /wp:image -->`;
}

async function processPost(post) {
  console.log(`\n── #${post.id} (${post.site}) — ${post.title}`);

  // 1. Fetch current content
  const r = await fetch(post.base + '/wp-json/wp/v2/posts/' + post.id + '?context=edit&_fields=content,date', {
    headers: { Authorization: post.auth },
  });
  if (!r.ok) throw new Error(`Fetch post failed: ${r.status}`);
  const original = await r.json();
  const content = original.content.raw;

  // 2. Locate the Adminator figure
  const found = findAdminatorFigure(content);
  if (!found) { console.log('  ✗ Adminator <figure> not found — skipping'); return false; }

  console.log('  ✓ Adminator figure located (' + found.figureText.length + ' chars)');

  // 3. Upload the new screenshot
  if (PUBLISH) console.log('  → Uploading ' + post.file + ' …');
  else         console.log('  → [dry-run] would upload ' + post.file);

  let media;
  if (PUBLISH) {
    media = await uploadMedia(post);
    console.log('  ✓ Uploaded as media #' + media.id);
    console.log('    ' + media.source_url);
  } else {
    media = { id: 0, source_url: '<NEW_URL_AFTER_PUBLISH>' };
  }

  // 4. Build replacement and patch content
  const replacement = buildReplacementFigure(media, post.alt);
  const newContent = content.slice(0, found.figureIndex)
    + replacement
    + content.slice(found.figureIndex + found.figureText.length);

  if (newContent === content) { console.log('  ✗ Replacement produced no change'); return false; }

  // 5. PUT post with new content + bumped date
  const now = new Date();
  const isoLocal = now.toISOString().slice(0, 19); // "2026-04-27T15:30:00"
  if (PUBLISH) {
    const put = await fetch(post.base + '/wp-json/wp/v2/posts/' + post.id, {
      method: 'POST', // WP REST also accepts POST for updates
      headers: { Authorization: post.auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newContent,
        date: isoLocal,
        date_gmt: now.toISOString().slice(0, 19),
      }),
    });
    if (!put.ok) {
      const text = await put.text();
      throw new Error(`Update failed (${put.status}): ${text.slice(0, 200)}`);
    }
    const updated = await put.json();
    console.log('  ✓ Post updated, new date: ' + updated.date);
  } else {
    console.log('  → [dry-run] would PUT { content: <patched>, date: ' + isoLocal + ' }');
  }

  return true;
}

// ── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  const list = ONE ? POSTS.filter((p) => p.id === ONE) : POSTS;
  if (list.length === 0) { console.error('No matching post.'); process.exit(1); }

  console.log(`\n${PUBLISH ? '🚀 PUBLISH MODE' : '🔍 DRY RUN'} — ${list.length} post(s)\n`);

  let ok = 0, fail = 0;
  for (const post of list) {
    try {
      const r = await processPost(post);
      if (r) ok++; else fail++;
      // Light rate limit between sites
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      fail++;
      console.log('  ✗ ' + e.message);
    }
  }

  console.log(`\n── Done: ${ok} ok, ${fail} failed`);
  if (!PUBLISH) console.log('\n(no changes made — pass --publish to apply)');
})();
