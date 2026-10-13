import { describe, it, expect } from 'vitest';
import { mountShell, NAV } from '../src/assets/scripts/2026/Shell.js';

function setupShellDom({ active = '', crumbs = '' } = {}) {
  document.body.setAttribute('data-active', active);
  document.body.setAttribute('data-crumbs', crumbs);
  document.body.innerHTML = `
    <div class="shell">
      <div data-shell-sidebar></div>
      <div class="main">
        <div data-shell-topbar></div>
        <main class="content"></main>
        <div data-shell-footer></div>
      </div>
    </div>
  `;
}

describe('Shell', () => {
  describe('NAV manifest', () => {
    it('exports a non-empty NAV array', () => {
      expect(Array.isArray(NAV)).toBe(true);
      expect(NAV.length).toBeGreaterThan(0);
    });

    it('every section has a label and a non-empty items array', () => {
      for (const section of NAV) {
        expect(typeof section.label).toBe('string');
        expect(Array.isArray(section.items)).toBe(true);
        expect(section.items.length).toBeGreaterThan(0);
      }
    });

    it('every leaf item has key + text + (href OR children)', () => {
      const visit = (item) => {
        expect(typeof item.key).toBe('string');
        expect(typeof item.text).toBe('string');
        if (item.children) {
          expect(Array.isArray(item.children)).toBe(true);
          item.children.forEach(visit);
        } else {
          expect(typeof item.href).toBe('string');
        }
      };
      NAV.forEach((s) => s.items.forEach(visit));
    });

    it('all keys are unique across the entire NAV', () => {
      const keys = [];
      const collect = (item) => {
        keys.push(item.key);
        if (item.children) item.children.forEach(collect);
      };
      NAV.forEach((s) => s.items.forEach(collect));
      const set = new Set(keys);
      expect(set.size).toBe(keys.length);
    });

    it('Adminator preview links go to colorlib.com/polygon, not GitHub Pages', () => {
      // Sanity check after the fix-preview-url incident.
      const allHrefs = [];
      NAV.forEach((s) => s.items.forEach((i) => {
        if (i.href) allHrefs.push(i.href);
        if (i.children) i.children.forEach((c) => c.href && allHrefs.push(c.href));
      }));
      // Internal page links should be relative HTML files, not external docs URLs.
      for (const h of allHrefs) {
        expect(h).not.toContain('puikinsh.github.io');
      }
    });
  });

  describe('mountShell()', () => {
    it('renders sidebar/topbar/footer into the placeholders', () => {
      setupShellDom({ active: 'dashboard', crumbs: 'Workspace | Dashboard' });
      mountShell();
      expect(document.querySelector('.d-sidebar')).toBeTruthy();
      expect(document.querySelector('.d-topbar')).toBeTruthy();
      expect(document.querySelector('.d-footer')).toBeTruthy();
    });

    it('marks the matching nav item as active', () => {
      setupShellDom({ active: 'dashboard', crumbs: 'Workspace | Dashboard' });
      mountShell();
      const activeLinks = document.querySelectorAll('.nav-link.is-active');
      expect(activeLinks.length).toBe(1);
      expect(activeLinks[0].textContent).toContain('Dashboard');
    });

    it('expands the parent nav-group when an active child is inside it', () => {
      setupShellDom({ active: 'datatable', crumbs: 'Components | Tables | Data' });
      mountShell();
      const openGroups = document.querySelectorAll('.nav-item-group.is-open');
      // The Tables group should be open because datatable is one of its children.
      expect(openGroups.length).toBeGreaterThan(0);
    });

    it('renders breadcrumb segments separated by chevron SVG', () => {
      setupShellDom({ active: 'email', crumbs: 'Communications | Email | Inbox' });
      mountShell();
      const crumbs = document.querySelector('.crumbs');
      expect(crumbs.textContent).toContain('Communications');
      expect(crumbs.textContent).toContain('Email');
      expect(crumbs.textContent).toContain('Inbox');
      // Last segment is highlighted
      const current = document.querySelector('.crumbs .current');
      expect(current).toBeTruthy();
      expect(current.textContent.trim()).toBe('Inbox');
    });

    it('includes the hamburger button in the topbar (for mobile drawer)', () => {
      setupShellDom({ active: 'dashboard', crumbs: 'Workspace | Dashboard' });
      mountShell();
      const burger = document.querySelector('.hamburger[data-drawer-open]');
      expect(burger).toBeTruthy();
    });

    it('includes the command palette trigger on the .cmd button', () => {
      setupShellDom({ active: 'dashboard', crumbs: 'Workspace | Dashboard' });
      mountShell();
      const cmd = document.querySelector('.cmd[data-palette-open]');
      expect(cmd).toBeTruthy();
    });

    it('silently no-ops when placeholders are missing (standalone pages)', () => {
      // signin.html / 404.html etc. have no shell placeholders.
      document.body.innerHTML = '<div>standalone</div>';
      expect(() => mountShell()).not.toThrow();
      expect(document.querySelector('.d-sidebar')).toBeFalsy();
    });
  });
});
