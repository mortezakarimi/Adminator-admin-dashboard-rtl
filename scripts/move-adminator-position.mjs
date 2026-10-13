#!/usr/bin/env node
/**
 * Moves Adminator's listicle entry to a higher position in each adminlte.io post.
 * Strategy per post: place Adminator at the boundary between the top
 * "premium / DashboardPack" cluster and the first non-DP competitor entry.
 *
 * Concretely, for each (postId, fromN, toN):
 *   1. Parse all numbered H3 entries (each with its full block — heading,
 *      figure, template-card, paragraphs, buttons)
 *   2. Pull Adminator's block out of position fromN
 *   3. Reinsert it at position toN (1-indexed)
 *   4. Renumber every entry so positions become 1..N contiguously
 *   5. PUT the post with the rewritten content + bumped date
 *
 * Title count doesn't change (total entry count is unchanged).
 *
 * Defaults to dry-run; pass --publish to mutate the live posts.
 *
 *   node scripts/move-adminator-position.mjs                # dry run
 *   node scripts/move-adminator-position.mjs --publish      # do it
 *   node scripts/move-adminator-position.mjs --post 322 --publish
 */

const adminlteAuth = 'Basic ' + Buffer.from('aigarssilkalns:5iBm 8D0X y3Ha Zner gfKU 7urZ').toString('base64');
const BASE = 'https://adminlte.io';

const MOVES = [
  { id: 322,  fromN: 32, toN: 10, label: 'free-dashboard-templates' },
  { id: 712,  fromN: 18, toN: 13, label: 'html-dashboard-template' },
  { id: 989,  fromN: 26, toN: 6,  label: 'bootstrap-login-forms' },
  { id: 4605, fromN: 20, toN: 3,  label: 'ecommerce-admin-dashboard-templates' },
  { id: 1146, fromN: 25, toN: 11, label: 'bootstrap-5-templates' },
];

const args = process.argv.slice(2);
const PUBLISH = args.includes('--publish');
const ONE = (() => { const i = args.indexOf('--post'); return i >= 0 ? Number(args[i + 1]) : null; })();

// ── Parse listicle ───────────────────────────────────────────────────────────

function findListicleSection(content) {
  // Match every H3 that begins with "<num>." — optionally preceded by a
  // Gutenberg <!-- wp:heading {"level":3} --> comment.
  const re = /(<!-- wp:heading\s+\{"level":3\}\s+-->\s*)?<h3\b[^>]*>\s*(\d+)\.\s+([^<]+)<\/h3>/g;
  const entries = [];
  let m;
  while ((m = re.exec(content))) {
    entries.push({
      headingStart: m.index,
      headingFull:  m[0],
      number:       parseInt(m[2]),
      title:        m[3].replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ').trim(),
    });
  }
  if (entries.length === 0) throw new Error('No numbered H3 entries found');

  // Each entry's block runs from its heading start to the NEXT heading start.
  // The LAST entry runs to either the next H2 or end of content.
  const lastEntry = entries[entries.length - 1];
  const reH2 = /<(?:!-- wp:heading\b[^>]*-->\s*)?h2\b/g;
  reH2.lastIndex = lastEntry.headingStart + lastEntry.headingFull.length;
  const nextH2 = reH2.exec(content);
  const sectionEnd = nextH2 ? nextH2.index : content.length;

  for (let i = 0; i < entries.length; i++) {
    const next = entries[i + 1];
    entries[i].blockStart = entries[i].headingStart;
    entries[i].blockEnd   = next ? next.headingStart : sectionEnd;
    entries[i].block      = content.slice(entries[i].blockStart, entries[i].blockEnd);
  }

  return { sectionStart: entries[0].headingStart, sectionEnd, entries };
}

function renumberHeading(block, newNumber) {
  // Replace the leading "<n>." with the new number, preserving the comment + tag attributes.
  return block.replace(
    /((?:<!-- wp:heading\s+\{"level":3\}\s+-->\s*)?<h3\b[^>]*>\s*)\d+(\.)/,
    '$1' + newNumber + '$2'
  );
}

function moveEntry(content, fromN, toN) {
  const { sectionStart, sectionEnd, entries } = findListicleSection(content);

  // Sort by number — gives canonical 1..N order.
  const ordered = [...entries].sort((a, b) => a.number - b.number);

  // Sanity: numbers must be contiguous 1..N
  for (let i = 0; i < ordered.length; i++) {
    if (ordered[i].number !== i + 1) {
      throw new Error('Numbering not contiguous — entry at index ' + i + ' has number ' + ordered[i].number);
    }
  }

  const fromEntry = ordered.find(e => e.number === fromN);
  if (!fromEntry) throw new Error('Entry #' + fromN + ' not found');

  // Build new ordering: remove fromEntry, insert at (toN - 1) in the new array.
  const without = ordered.filter(e => e !== fromEntry);
  const newOrder = [...without.slice(0, toN - 1), fromEntry, ...without.slice(toN - 1)];

  // Reassemble: each entry gets number = its new index + 1.
  let newSection = '';
  const renumberMap = [];
  for (let i = 0; i < newOrder.length; i++) {
    const newNum = i + 1;
    const oldNum = newOrder[i].number;
    if (oldNum !== newNum) renumberMap.push({ from: oldNum, to: newNum, title: newOrder[i].title });
    newSection += renumberHeading(newOrder[i].block, newNum);
  }

  const newContent = content.slice(0, sectionStart) + newSection + content.slice(sectionEnd);
  return { newContent, renumberMap, totalEntries: newOrder.length };
}

// ── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  const list = ONE ? MOVES.filter(m => m.id === ONE) : MOVES;
  if (list.length === 0) { console.error('No matching post.'); process.exit(1); }

  console.log(`\n${PUBLISH ? '🚀 PUBLISH MODE' : '🔍 DRY RUN'} — ${list.length} post(s)\n`);

  let ok = 0, fail = 0;
  for (const move of list) {
    console.log(`── #${move.id} (${move.label}) — moving #${move.fromN} → #${move.toN}`);
    try {
      const r = await fetch(BASE + '/wp-json/wp/v2/posts/' + move.id + '?context=edit&_fields=content,title', { headers: { Authorization: adminlteAuth } });
      if (!r.ok) throw new Error('Fetch failed: ' + r.status);
      const post = await r.json();
      const content = post.content.raw;

      const { newContent, renumberMap, totalEntries } = moveEntry(content, move.fromN, move.toN);
      console.log(`  ✓ Reordered (${totalEntries} entries, ${renumberMap.length} renumbered)`);
      console.log(`  Renumber preview (first 5):`);
      for (const r of renumberMap.slice(0, 5)) {
        console.log(`    #${String(r.from).padStart(2)} → #${String(r.to).padStart(2)}  ${r.title.slice(0, 55)}`);
      }
      if (renumberMap.length > 5) console.log(`    … and ${renumberMap.length - 5} more`);

      if (PUBLISH) {
        const now = new Date();
        const isoLocal = now.toISOString().slice(0, 19);
        const put = await fetch(BASE + '/wp-json/wp/v2/posts/' + move.id, {
          method: 'POST',
          headers: { Authorization: adminlteAuth, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: newContent,
            date: isoLocal,
            date_gmt: now.toISOString().slice(0, 19),
          }),
        });
        if (!put.ok) throw new Error('Update failed: ' + put.status + ' ' + (await put.text()).slice(0, 200));
        const updated = await put.json();
        console.log(`  ✓ Post updated, new date: ${updated.date}`);
      } else {
        console.log(`  → [dry-run] would PUT { content: <${newContent.length - content.length >= 0 ? '+' : ''}${newContent.length - content.length} char delta>, date: now }`);
      }
      ok++;
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.log('  ✗ ' + e.message);
      fail++;
    }
    console.log('');
  }

  console.log(`── Done: ${ok} ok, ${fail} failed`);
  if (!PUBLISH) console.log('\n(no changes made — pass --publish to apply)');
})();
