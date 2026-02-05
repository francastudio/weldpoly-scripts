/**
 * Weldpoly Locomotive Scroll Init
 * Initializes Locomotive Scroll with Lenis options
 * Requires: Locomotive Scroll (https://cdn.jsdelivr.net/npm/locomotive-scroll@beta/bundled/locomotive-scroll.min.js)
 */
(function() {
  'use strict';

  if (typeof LocomotiveScroll === 'undefined') {
    console.warn('weldpoly-locomotive-init: LocomotiveScroll not loaded');
    return;
  }

  window.locomotiveScroll = new LocomotiveScroll({
    lenisOptions: {
      lerp: 0.1,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    }
  });
})();
