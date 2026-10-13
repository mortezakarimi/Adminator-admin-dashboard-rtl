/**
 * FullCalendar bundle entry.
 *
 * Exists for the same reason as vendor-jsvectormap.js: it keeps the library,
 * its four plugins and its stylesheet in a single async chunk, so the readable
 * `vendor-fullcalendar` name stays attached to the JS rather than the CSS.
 *
 * v7 collapsed the old `@fullcalendar/*` scope into one `fullcalendar` package
 * with subpath exports, and ships its base styles as `skeleton.css` — in v6 the
 * styles rode along with each plugin import. `_fullcalendar.scss` layers the
 * 2026 tokens on top of that skeleton.
 *
 * Only calendar.js imports this, and only via dynamic import().
 */

import { Calendar } from 'fullcalendar';
import dayGridPlugin from 'fullcalendar/daygrid';
import timeGridPlugin from 'fullcalendar/timegrid';
import listPlugin from 'fullcalendar/list';
import interactionPlugin from 'fullcalendar/interaction';
import classicTheme from 'fullcalendar/themes/classic';

/* Structural styles, then the theme's rules. Deliberately NOT
   'fullcalendar/themes/classic/palette.css' — that file hard-codes FullCalendar's
   own colors into :root. _fullcalendar.scss supplies the palette instead, mapping
   every --fc-classic-* variable onto a 2026 design token, which is what makes the
   calendar follow the light/dark theme for free. */
import 'fullcalendar/skeleton.css';
import 'fullcalendar/themes/classic/theme.css';

export { Calendar };
export const plugins = [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, classicTheme];
