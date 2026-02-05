/**
 * Weldpoly Nav Contrast
 * Toggles logo and menu color when nav is over light/dark background sections
 *
 * DEBUG: Add ?nav_debug=1 to URL, or run: window.NAV_CONTRAST_DEBUG = true; location.reload()
 */
(function() {
  // Light sections: add data-nav-contrast="light" to any section with white/light bg
  const LIGHT_SECTIONS = '.background-color-white, .background-color-primary';
  const DEBUG = !!(window.NAV_CONTRAST_DEBUG || /[?&]nav_debug=1/.test(location.search));

  function debug(...args) {
    if (DEBUG) console.log('[Nav Contrast]', ...args);
  }

  function initNavContrast() {
    const nav = document.querySelector('.navigation_container');
    if (!nav) {
      debug('❌ Nav not found (.navigation_container)');
      return;
    }
    debug('✅ Nav found:', nav);

    const lightSections = document.querySelectorAll(LIGHT_SECTIONS);
    if (!lightSections.length) {
      debug('❌ No light sections found. Selector:', LIGHT_SECTIONS);
      return;
    }
    debug('✅ Light sections found:', lightSections.length, lightSections);

    const navHeight = 80;
    const options = {
      root: null,
      rootMargin: `-${navHeight}px 0px 0px 0px`,
      threshold: [0, 0.01, 0.5, 1]
    };
    debug('Observer options:', options);

    let isOverLight = false;

    const callback = (entries) => {
      entries.forEach(e => {
        debug('Intersection:', {
          target: e.target,
          isIntersecting: e.isIntersecting,
          intersectionRatio: e.intersectionRatio
        });
      });
      const overLight = entries.some(e => e.isIntersecting);
      if (overLight !== isOverLight) {
        isOverLight = overLight;
        nav.classList.toggle('nav--over-light', isOverLight);
        debug('🔄 State changed → isOverLight:', isOverLight, '| class nav--over-light:', isOverLight);
      }
    };

    const observer = new IntersectionObserver(callback, options);
    lightSections.forEach(section => observer.observe(section));
    debug('Observer attached to', lightSections.length, 'sections');

    // Check if element under nav bottom is in a light section
    const checkUnderNav = () => {
      const rect = nav.getBoundingClientRect();
      const checkY = rect.bottom - 5;
      const centerX = window.innerWidth / 2;
      const elAtPoint = document.elementFromPoint(centerX, checkY);
      const inLightSection = elAtPoint?.closest(LIGHT_SECTIONS);
      const shouldBeLight = !!inLightSection;
      if (shouldBeLight !== isOverLight) {
        isOverLight = shouldBeLight;
        nav.classList.toggle('nav--over-light', isOverLight);
        debug('🔄 checkUnderNav:', { checkY, elAtPoint, inLightSection, shouldBeLight });
      }
      return shouldBeLight;
    };

    checkUnderNav();
    window.addEventListener('load', () => { checkUnderNav(); });

    // With Locomotive Scroll, IntersectionObserver can miss updates; poll on scroll
    let scrollTicking = false;
    const onScroll = () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        checkUnderNav();
        scrollTicking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.documentElement.addEventListener('scroll', onScroll, { passive: true });
    // Locomotive Scroll V5 (Lenis) – scroll container may not trigger window scroll
    const hookLenis = () => {
      const ls = window.locomotiveScroll || window.scroll?.locomotive;
      if (ls && ls.lenis) {
        ls.lenis.on('scroll', onScroll);
        return true;
      }
      return false;
    };
    if (!hookLenis()) {
      document.addEventListener('DOMContentLoaded', () => { hookLenis() && checkUnderNav(); });
      setTimeout(() => { hookLenis() && checkUnderNav(); }, 1500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavContrast);
  } else {
    initNavContrast();
  }
})();
