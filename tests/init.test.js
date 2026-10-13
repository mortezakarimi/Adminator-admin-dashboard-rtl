import { describe, it, expect, beforeEach } from 'vitest';
import { initShellBehaviors } from '../src/assets/scripts/2026/init.js';

describe('init.js — initShellBehaviors', () => {
  describe('theme toggle', () => {
    beforeEach(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.innerHTML = '<button id="themeToggle"></button>';
      initShellBehaviors();
    });

    it('inserts the moon icon when theme is light', () => {
      const btn = document.getElementById('themeToggle');
      expect(btn.innerHTML).toContain('M21 12.8'); // moon path d
    });

    it('toggles to dark on click', () => {
      const btn = document.getElementById('themeToggle');
      btn.click();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('persists the choice to localStorage', () => {
      document.getElementById('themeToggle').click();
      expect(localStorage.getItem('dash26-theme')).toBe('dark');
    });

    it('toggles back to light on second click', () => {
      const btn = document.getElementById('themeToggle');
      btn.click(); // dark
      btn.click(); // light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('updates the icon to sun in dark mode', () => {
      const btn = document.getElementById('themeToggle');
      btn.click();
      expect(btn.innerHTML).toContain('circle cx="12" cy="12" r="4"'); // sun core
    });
  });

  describe('hero date', () => {
    it('populates #heroDate with today\'s formatted date', () => {
      document.body.innerHTML = '<span id="heroDate">PLACEHOLDER</span>';
      initShellBehaviors();
      const text = document.getElementById('heroDate').textContent;
      expect(text).not.toBe('PLACEHOLDER');
      expect(text.split(' · ').length).toBe(3); // "Day · Month DD · YYYY"
    });

    it('does nothing when #heroDate is absent', () => {
      document.body.innerHTML = '';
      expect(() => initShellBehaviors()).not.toThrow();
    });
  });

  describe('nav groups', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="nav-item-group" data-nav-group>
          <a href="javascript:void(0)" data-nav-toggle>Tables</a>
        </div>
      `;
      initShellBehaviors();
    });

    it('toggles is-open on the parent group when the trigger is clicked', () => {
      const group = document.querySelector('[data-nav-group]');
      expect(group.classList.contains('is-open')).toBe(false);
      document.querySelector('[data-nav-toggle]').click();
      expect(group.classList.contains('is-open')).toBe(true);
      document.querySelector('[data-nav-toggle]').click();
      expect(group.classList.contains('is-open')).toBe(false);
    });
  });

  describe('dropdowns', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="dd-wrap">
          <button data-dropdown>Open A</button>
        </div>
        <div class="dd-wrap">
          <button data-dropdown>Open B</button>
        </div>
      `;
      initShellBehaviors();
    });

    it('opens on click', () => {
      const wrap = document.querySelectorAll('.dd-wrap')[0];
      wrap.querySelector('[data-dropdown]').click();
      expect(wrap.classList.contains('is-open')).toBe(true);
    });

    it('closes other dropdowns when one opens', () => {
      const [a, b] = document.querySelectorAll('.dd-wrap');
      a.querySelector('[data-dropdown]').click();
      b.querySelector('[data-dropdown]').click();
      expect(a.classList.contains('is-open')).toBe(false);
      expect(b.classList.contains('is-open')).toBe(true);
    });

    it('closes all on Escape', () => {
      const wrap = document.querySelectorAll('.dd-wrap')[0];
      wrap.querySelector('[data-dropdown]').click();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(wrap.classList.contains('is-open')).toBe(false);
    });
  });

  describe('todo checkboxes', () => {
    it('toggles is-done on the parent .todo-item', () => {
      document.body.innerHTML = `
        <li class="todo-item">
          <input type="checkbox" class="todo-check">
        </li>
      `;
      initShellBehaviors();
      const cb = document.querySelector('.todo-check');
      cb.checked = true;
      cb.dispatchEvent(new Event('change'));
      expect(document.querySelector('.todo-item').classList.contains('is-done')).toBe(true);
    });
  });

  describe('accordions', () => {
    it('toggles is-open on the parent accordion item', () => {
      document.body.innerHTML = `
        <div class="accordion-item" data-accordion>
          <button data-accordion-trigger>Q</button>
        </div>
      `;
      initShellBehaviors();
      const item = document.querySelector('[data-accordion]');
      document.querySelector('[data-accordion-trigger]').click();
      expect(item.classList.contains('is-open')).toBe(true);
      document.querySelector('[data-accordion-trigger]').click();
      expect(item.classList.contains('is-open')).toBe(false);
    });
  });

  describe('tab groups', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-tab-group>
          <a class="tab is-active" data-tab-target="a">A</a>
          <a class="tab" data-tab-target="b">B</a>
          <div class="tab-panel is-active" data-tab-id="a">A content</div>
          <div class="tab-panel" data-tab-id="b">B content</div>
        </div>
      `;
      initShellBehaviors();
    });

    it('switches active tab + panel on click', () => {
      const [a, b] = document.querySelectorAll('.tab');
      const [pa, pb] = document.querySelectorAll('.tab-panel');
      b.click();
      expect(a.classList.contains('is-active')).toBe(false);
      expect(b.classList.contains('is-active')).toBe(true);
      expect(pa.classList.contains('is-active')).toBe(false);
      expect(pb.classList.contains('is-active')).toBe(true);
    });
  });

  describe('mobile drawer', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <button class="hamburger" data-drawer-open>≡</button>
        <aside class="d-sidebar">
          <a href="email.html">Email</a>
          <a href="javascript:void(0)" data-nav-toggle>Group</a>
        </aside>
      `;
      initShellBehaviors();
    });

    it('appends a .drawer-backdrop to body', () => {
      expect(document.querySelector('.drawer-backdrop')).toBeTruthy();
    });

    it('opens on hamburger click (adds has-drawer-open to body)', () => {
      document.querySelector('[data-drawer-open]').click();
      expect(document.body.classList.contains('has-drawer-open')).toBe(true);
    });

    it('closes on backdrop click', () => {
      document.querySelector('[data-drawer-open]').click();
      document.querySelector('.drawer-backdrop').click();
      expect(document.body.classList.contains('has-drawer-open')).toBe(false);
    });

    it('closes on Escape', () => {
      document.querySelector('[data-drawer-open]').click();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(document.body.classList.contains('has-drawer-open')).toBe(false);
    });

    it('auto-closes when a real nav-link inside the sidebar is clicked', () => {
      document.querySelector('[data-drawer-open]').click();
      document.querySelector('.d-sidebar a[href="email.html"]').click();
      expect(document.body.classList.contains('has-drawer-open')).toBe(false);
    });

    it('does NOT close when a javascript:void(0) toggle (nav-group) is clicked', () => {
      document.querySelector('[data-drawer-open]').click();
      document.querySelector('.d-sidebar a[href="javascript:void(0)"]').click();
      expect(document.body.classList.contains('has-drawer-open')).toBe(true);
    });
  });
});
