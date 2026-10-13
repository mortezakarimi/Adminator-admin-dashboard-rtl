/**
 * jsvectormap bundle entry.
 *
 * Exists so the library, its world-map data and its stylesheet all land in a
 * single async chunk. Importing the three separately from maps.js split the
 * JS and the CSS into two chunks, and the readable `vendor-jsvectormap` name
 * attached to the CSS one, leaving the JS with a numeric id.
 *
 * Only maps.js imports this, and only via dynamic import().
 */

import jsVectorMap from 'jsvectormap';
import 'jsvectormap/dist/maps/world.js';
import 'jsvectormap/dist/jsvectormap.css';

export default jsVectorMap;
