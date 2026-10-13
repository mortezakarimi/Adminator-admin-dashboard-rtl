/**
 * 2026 entry point.
 *
 * Order of operations:
 *   1. Import the SCSS bundle (extracted to its own CSS file in production).
 *   2. Mount the shell (sidebar/topbar/footer) into the page placeholders.
 *   3. Wire shell behaviors (theme toggle, dropdowns, nav groups, todos).
 *
 * Each *-2026.html page has data-active + data-crumbs on <body> and three
 * placeholder divs ([data-shell-sidebar], [data-shell-topbar],
 * [data-shell-footer]) inside the .shell wrapper.
 */

import '../../styles/2026/index.scss';
import { mountShell } from './Shell.js';
import { initShellBehaviors } from './init.js';
import { initCharts } from './charts.js';
import { initVectorMaps } from './maps.js';
import { initCalendarPage } from './calendar.js';
import { initPalette } from './palette.js';

function start() {
  mountShell();
  initShellBehaviors();
  initPalette();
  initCharts();
  initVectorMaps();
  initCalendarPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
