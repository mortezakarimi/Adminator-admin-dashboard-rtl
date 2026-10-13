#!/usr/bin/env node
/**
 * Inserts Adminator entries into 6 adminlte.io blog posts where it isn't currently
 * listed (chosen from GSC data — see chat thread for the full audit).
 *
 * For each post:
 *   1. Uploads the appropriate v4 screenshot to adminlte.io media library
 *   2. Builds an entry block in that post's existing style (template-card,
 *      blog-btn, or editorial paragraph)
 *   3. Splices the entry in at a sensible boundary (before the post's
 *      first H2 after the last numbered listicle entry)
 *   4. Bumps the post title's count (e.g. "31 Best …" → "32 Best …")
 *   5. PUTs the post with the patched content + title + date = now
 *
 * Defaults to dry-run. Pass --publish to mutate the live site.
 *
 *   node scripts/insert-adminator-listings.mjs                   # dry run
 *   node scripts/insert-adminator-listings.mjs --publish         # do it
 *   node scripts/insert-adminator-listings.mjs --post 322 --publish
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.join(ROOT, 'screenshots', 'posts');

// ── Auth ──────────────────────────────────────────────────────────────────────
const adminlteAuth = 'Basic ' + Buffer.from('aigarssilkalns:5iBm 8D0X y3Ha Zner gfKU 7urZ').toString('base64');
const BASE = 'https://adminlte.io';

// ── Reusable HTML fragments ──────────────────────────────────────────────────

function templateCard({ stack, price, bestFor, highlight }) {
  return `<div class="template-card">
<div class="template-card__meta">
<span class="template-card__badge template-card__badge--stack">${stack}</span><br />
<span class="template-card__badge template-card__badge--price-${price.toLowerCase().includes('free') ? 'free' : 'paid'}">${price}</span><br />
<span class="template-card__badge template-card__badge--best-for">Best for: ${bestFor}</span>
</div>
<p class="template-card__highlight"><strong>Why we like it:</strong> ${highlight}</p>
</div>`;
}

function blogBtn(downloadUrl, previewUrl) {
  return `<div class="blog-btn">
<a class="preview_btn" href="${downloadUrl}" target="_blank" rel="nofollow noopener">Download</a>
<a class="cart_btn" href="${previewUrl}" target="_blank" rel="nofollow noopener">Preview</a>
</div>`;
}

const GH_URL = 'https://github.com/puikinsh/Adminator-admin-dashboard';
// Live preview lives on Colorlib's polygon subdomain — NOT GitHub Pages.
const DEMO_URL = 'https://preview.colorlib.com/theme/adminator/index.html';
const DEMO_BASE = 'https://preview.colorlib.com/theme/adminator/';

// ── Per-post entry builders ───────────────────────────────────────────────────

const POSTS = [
  // ── Tier 1 ────────────────────────────────────────────────────────────────
  {
    id: 322,
    title: '31 Best Free & Premium Dashboard Templates 2026',
    image: 'adminator-2026-dashboard-light-1200x800.png',
    contentType: 'image/png',
    altText: 'Adminator 2026 — vanilla JS admin dashboard with token-driven CSS variable design system',
    nextNumber: 32,
    titleCountBump: { from: '31', to: '32' },
    insertBefore: '<h2 class="wp-block-heading">Choosing the Right Dashboard Template',
    buildEntry: (media) => `<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">${POSTS[0].nextNumber}. Adminator</h3>
<!-- /wp:heading -->

<!-- wp:heading {"level":4} -->
<h4 class="wp-block-heading">⭐ 5,000+ GitHub Stars · Free (MIT)</h4>
<!-- /wp:heading -->

<!-- wp:image {"id":${media.id},"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="${media.source_url}" alt="${POSTS[0].altText}" class="wp-image-${media.id}"/></figure>
<!-- /wp:image -->

<!-- wp:html -->
${templateCard({
  stack: 'Vanilla JS / SCSS / Webpack 5',
  price: 'Free / MIT',
  bestFor: 'Teams who want a lightweight admin without framework lock-in',
  highlight: 'The 2026 v4 release dropped Bootstrap entirely and now ships in ~700 KB of JS — an 85% reduction from v3 — while gaining a real token-driven CSS variable design system with native dark mode.',
})}
<!-- /wp:html -->

<!-- wp:paragraph -->
<p>Adminator is a long-running free admin dashboard template that just received a major modernization. The 2026 v4 release replaces the entire Bootstrap-based UI with a custom design system built on CSS custom properties — 28+ semantic tokens defined twice for light + dark themes. Sidebar, topbar, and footer render from a single JS manifest, so adding a nav item is a one-line change across all 18 pages.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Heavy widgets are real and themed: Chart.js for the dashboard charts, FullCalendar for the calendar, and jsvectormap for the world map — all of which read CSS variables on render and re-render automatically when you toggle the theme. The legacy v3 Bootstrap-based codebase is preserved on the <code>legacy-v3</code> branch for users who prefer the original design.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
${blogBtn(GH_URL, DEMO_URL)}
<!-- /wp:html -->`,
  },

  {
    id: 712,
    title: '17 Best HTML Dashboard Template Examples 2026',
    image: 'adminator-2026-dashboard-light-1200x800.png',
    contentType: 'image/png',
    altText: 'Adminator 2026 HTML admin dashboard template — vanilla JS, no Bootstrap',
    nextNumber: 18,
    titleCountBump: { from: '17', to: '18' },
    insertBefore: null, // No clear H2 boundary — append at end of content
    insertAtEnd: true,
    buildEntry: (media) => `<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">${POSTS[1].nextNumber}. Adminator</h3>
<!-- /wp:heading -->

<!-- wp:image {"id":${media.id},"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="${media.source_url}" alt="${POSTS[1].altText}" class="wp-image-${media.id}"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Adminator is a free HTML admin dashboard template that recently shipped a 2026 v4 redesign — a ground-up rewrite that drops Bootstrap and replaces it with a token-driven CSS variable design system. The whole template now ships in ~700 KB of vanilla JS (an 85% reduction from v3) while gaining native light/dark themes that flip via a single <code>data-theme</code> attribute on <code>&lt;html&gt;</code>.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The 18 included pages cover every standard admin scenario — dashboard with KPIs and Chart.js, FullCalendar with seed events, a 3-pane email inbox, data tables, charts gallery, forms, sign-in/sign-up, and 404/500. All UI primitives (buttons, dropdowns, alerts, modals, tabs) are custom-built and theme-aware. The legacy v3 codebase is still available on the <code>legacy-v3</code> branch for teams who prefer the original Bootstrap-based design.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
${blogBtn(GH_URL, DEMO_URL)}
<!-- /wp:html -->`,
  },

  {
    id: 3835,
    title: "Best Admin Dashboard Color Schemes: A Developer's Guide to Dashboard Design",
    image: null, // Editorial sub-section, no image
    titleCountBump: null, // No number prefix in title
    insertBefore: '<p>For a hands-on comparison of these templates and many more',
    buildEntry: () => `<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Adminator</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Adminator's 2026 v4 release is a textbook example of fully token-driven dashboard theming. The entire color system lives in a single <code>_tokens.scss</code> file: 28+ semantic tokens (<code>--bg-body</code>, <code>--bg-card</code>, <code>--t-base</code>, <code>--primary</code>, <code>--primary-soft</code>, <code>--success</code>, <code>--success-soft</code>, etc.) defined twice — once under <code>:root[data-theme="light"]</code> and once under <code>:root[data-theme="dark"]</code>. Switching themes is a single attribute flip on <code>&lt;html&gt;</code>; no JavaScript touches color values. A neat detail is the <code>-soft</code> companion token paired with every brand color, used for tinted alert/badge backgrounds that stay legible in both modes. The full token list is in the project's <a href="${GH_URL}/blob/master/src/assets/styles/2026/_tokens.scss" target="_blank" rel="nofollow noopener">tokens.scss on GitHub</a>.</p>
<!-- /wp:paragraph -->`,
  },

  // ── Tier 2 ────────────────────────────────────────────────────────────────
  {
    id: 989,
    title: '25 Best Bootstrap Login Forms 2026 – Free Templates',
    image: 'adminator-2026-signin-1920x1200.jpg',
    contentType: 'image/jpeg',
    altText: 'Adminator 2026 sign-in page — split-screen design with brand panel and social auth, no Bootstrap',
    nextNumber: 26,
    titleCountBump: { from: '25', to: '26' },
    insertBefore: '<h2 class="wp-block-heading">Key Features Comparison',
    buildEntry: (media) => `<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">${POSTS[3].nextNumber}. Adminator Sign-In – Modern Split-Screen (Bootstrap-Free Alternative)</h3>
<!-- /wp:heading -->

<!-- wp:image {"id":${media.id},"sizeSlug":"large","linkDestination":"custom"} -->
<figure class="wp-block-image size-large"><a href="${DEMO_BASE}signin.html" target="_blank" rel="noopener"><img src="${media.source_url}" alt="${POSTS[3].altText}" class="wp-image-${media.id}"/></a></figure>
<!-- /wp:image -->

<!-- wp:html -->
${templateCard({
  stack: 'Vanilla JS / SCSS (no Bootstrap)',
  price: 'Free / MIT',
  bestFor: 'Teams looking for a no-Bootstrap split-screen sign-in with social auth and dark mode',
  highlight: 'Ships as part of the Adminator 2026 dashboard — a brand-panel-on-the-left, form-on-the-right layout with Google / GitHub / Apple buttons and full keyboard accessibility.',
})}
<!-- /wp:html -->

<!-- wp:paragraph -->
<p>Most templates in this roundup are Bootstrap-based; this one is the modern, framework-free alternative. Adminator's 2026 v4 sign-in page uses a split-screen layout: a gradient brand panel on the left with marketing copy and a quote, and a centered sign-in form on the right with email + password fields, "keep me signed in" toggle, and three social-login buttons (Google, GitHub, Apple). The whole page works in light and dark mode and the form ships with HTML5 validation already wired up.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
${blogBtn(GH_URL, DEMO_BASE + 'signin.html')}
<!-- /wp:html -->`,
  },

  {
    id: 4605,
    title: '19 Best E-Commerce Admin Dashboard Templates 2026',
    image: 'adminator-2026-dashboard-light-1200x800.png',
    contentType: 'image/png',
    altText: 'Adminator 2026 admin dashboard — versatile vanilla JS template usable as an e-commerce admin',
    nextNumber: 20,
    titleCountBump: { from: '19', to: '20' },
    insertBefore: '<h2 class="wp-block-heading">How to Choose the Right E-Commerce Dashboard',
    buildEntry: (media) => `<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">${POSTS[4].nextNumber}. Adminator (General-Purpose Free Option)</h3>
<!-- /wp:heading -->

<!-- wp:image {"id":${media.id},"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="${media.source_url}" alt="${POSTS[4].altText}" class="wp-image-${media.id}"/></figure>
<!-- /wp:image -->

<!-- wp:html -->
${templateCard({
  stack: 'Vanilla JS / SCSS / Webpack 5',
  price: 'Free / MIT',
  bestFor: 'Indie sellers and small e-commerce shops that need a free, lightweight admin to start with',
  highlight: 'A free, generic dashboard template that adapts well to e-commerce backends — ships with data tables, charts, forms, and a modern token-driven design that\'s easy to customize for product/order/customer screens.',
})}
<!-- /wp:html -->

<!-- wp:paragraph -->
<p>Adminator isn't an e-commerce-specific template, but its 2026 v4 release makes it a strong free starting point for anyone building an e-commerce admin from scratch. The included data table page handles sorting, filtering, and pagination — perfect for product or order listings. The dashboard's KPI grid and Chart.js integration cover sales/revenue/customer-count widgets out of the box, and the forms page provides a complete profile-style form layout you can adapt for product editing.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>What makes it worth considering for e-commerce specifically: it's free under MIT, has zero framework lock-in (no React, no Vue, no Bootstrap), ships in only ~700 KB of JS, and the design system is token-driven so re-skinning to match your brand is a single SCSS file. If you need vertical-specific features (cart management, payment integrations, inventory dashboards), build on top of Adminator rather than expecting them out of the box.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
${blogBtn(GH_URL, DEMO_URL)}
<!-- /wp:html -->`,
  },

  {
    id: 1146,
    title: '24 Best Bootstrap 5 Admin Templates 2026',
    image: 'adminator-2026-dashboard-light-1200x800.png',
    contentType: 'image/png',
    altText: 'Adminator 2026 admin dashboard — formerly Bootstrap-based, now a vanilla JS alternative',
    nextNumber: 25,
    titleCountBump: { from: '24', to: '25' },
    insertBefore: '<h2 class="wp-block-heading">Why Bootstrap 5 for Admin Templates?',
    buildEntry: (media) => `<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">${POSTS[5].nextNumber}. Adminator (Bootstrap Legacy + 2026 Bootstrap-Free Rewrite)</h3>
<!-- /wp:heading -->

<!-- wp:image {"id":${media.id},"sizeSlug":"large"} -->
<figure class="wp-block-image size-large"><img src="${media.source_url}" alt="${POSTS[5].altText}" class="wp-image-${media.id}"/></figure>
<!-- /wp:image -->

<!-- wp:html -->
${templateCard({
  stack: 'Bootstrap 5 (legacy v3) → Vanilla JS (v4)',
  price: 'Free / MIT',
  bestFor: 'Teams currently on Bootstrap-based Adminator considering the leaner vanilla rewrite',
  highlight: 'Adminator was a popular free Bootstrap 5 admin template for years. The 2026 v4 release is a complete rewrite that drops Bootstrap entirely — included here as the modern direction for the project, while the legacy v3 Bootstrap-based codebase remains available for download.',
})}
<!-- /wp:html -->

<!-- wp:paragraph -->
<p><strong>Heads-up:</strong> the screenshot above is the new 2026 v4 release, which intentionally <em>removes</em> Bootstrap. Adminator's history is firmly in the Bootstrap world — the project ran on Bootstrap 5 for years and was a well-known free option in this space — but the v4 release rebuilt everything around CSS custom properties and a custom shell renderer. Production JS dropped from ~4.5 MB to ~700 KB as a result.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>If you specifically want the Bootstrap-based version, it's preserved indefinitely on the <a href="${GH_URL}/tree/legacy-v3" target="_blank" rel="nofollow noopener">legacy-v3 branch</a> and the <a href="${GH_URL}/releases/tag/v3.0.0" target="_blank" rel="nofollow noopener">v3.0.0 release tag</a>, and will continue to receive security updates. If you're starting fresh and don't need Bootstrap, the new v4 is the recommended path — same project name, much lighter footprint.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
${blogBtn(GH_URL, DEMO_URL)}
<!-- /wp:html -->`,
  },
];

// ── CLI ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const PUBLISH = args.includes('--publish');
const ONE = (() => { const i = args.indexOf('--post'); return i >= 0 ? Number(args[i + 1]) : null; })();

// ── Helpers ──────────────────────────────────────────────────────────────────

async function uploadMedia(post) {
  if (!post.image) return null;
  const filePath = path.join(SCREENSHOTS_DIR, post.image);
  if (!fs.existsSync(filePath)) throw new Error(`Local file missing: ${filePath}`);
  const buf = fs.readFileSync(filePath);
  const r = await fetch(BASE + '/wp-json/wp/v2/media', {
    method: 'POST',
    headers: {
      Authorization: adminlteAuth,
      'Content-Type': post.contentType,
      'Content-Disposition': `attachment; filename="${post.image}"`,
    },
    body: buf,
  });
  if (!r.ok) throw new Error(`Upload failed (${r.status}): ${(await r.text()).slice(0, 200)}`);
  const media = await r.json();
  await fetch(BASE + '/wp-json/wp/v2/media/' + media.id, {
    method: 'POST',
    headers: { Authorization: adminlteAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ alt_text: post.altText }),
  });
  return media;
}

function findInsertionIndex(content, post) {
  if (post.insertAtEnd) return content.length;
  if (!post.insertBefore) throw new Error('insertBefore not specified');
  const idx = content.indexOf(post.insertBefore);
  if (idx < 0) throw new Error('Insertion marker not found: ' + post.insertBefore.slice(0, 60));
  return idx;
}

function bumpTitleCount(title, bump) {
  if (!bump) return title;
  // Bump the leading number (e.g. "31 Best …" → "32 Best …")
  const re = new RegExp('^' + bump.from + '\\b');
  if (!re.test(title)) {
    console.log('  ⚠ Title does not start with "' + bump.from + '" — skipping count bump');
    return title;
  }
  return title.replace(re, bump.to);
}

async function processPost(post) {
  console.log(`\n── #${post.id} — ${post.title}`);

  // 1. Sanity check: is Adminator already mentioned?
  const r = await fetch(BASE + '/wp-json/wp/v2/posts/' + post.id + '?context=edit&_fields=title,content', { headers: { Authorization: adminlteAuth } });
  if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
  const original = await r.json();
  const content = original.content.raw;
  const titleRaw = original.title.raw;

  if (/adminator/i.test(content)) {
    console.log('  ✗ Post already mentions Adminator — skipping');
    return false;
  }

  // 2. Upload media (if image)
  let media = null;
  if (post.image) {
    if (PUBLISH) console.log('  → Uploading ' + post.image + ' …');
    else         console.log('  → [dry-run] would upload ' + post.image);
    if (PUBLISH) {
      media = await uploadMedia(post);
      console.log('  ✓ Uploaded as media #' + media.id);
      console.log('    ' + media.source_url);
    } else {
      media = { id: 99999, source_url: '<NEW_URL_AFTER_PUBLISH>' };
    }
  }

  // 3. Build entry HTML
  const entry = post.buildEntry(media);
  console.log('  ✓ Entry built (' + entry.length + ' chars)');

  // 4. Find insertion point
  const idx = findInsertionIndex(content, post);
  const newContent = content.slice(0, idx) + '\n\n' + entry + '\n\n' + content.slice(idx);

  // 5. Bump title count
  const newTitle = bumpTitleCount(titleRaw, post.titleCountBump);

  // 6. PUT
  const now = new Date();
  const isoLocal = now.toISOString().slice(0, 19);
  if (PUBLISH) {
    const put = await fetch(BASE + '/wp-json/wp/v2/posts/' + post.id, {
      method: 'POST',
      headers: { Authorization: adminlteAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newContent,
        title: newTitle,
        date: isoLocal,
        date_gmt: now.toISOString().slice(0, 19),
      }),
    });
    if (!put.ok) throw new Error(`Update failed (${put.status}): ${(await put.text()).slice(0, 200)}`);
    const updated = await put.json();
    console.log('  ✓ Post updated, new title: "' + (updated.title.raw || updated.title.rendered).slice(0, 60) + '…"');
    console.log('    new date: ' + updated.date);
  } else {
    console.log('  → [dry-run] would PUT { title: "' + newTitle.slice(0, 60) + '…", content: <patched +' + (newContent.length - content.length) + ' chars>, date: ' + isoLocal + ' }');
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
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      fail++;
      console.log('  ✗ ' + e.message);
    }
  }
  console.log(`\n── Done: ${ok} ok, ${fail} failed`);
  if (!PUBLISH) console.log('\n(no changes made — pass --publish to apply)');
})();
