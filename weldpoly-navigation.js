/**
 * Weldpoly Navigation — Unified script
 * Combines: centered nav toggle + nav contrast + scroll background
 *
 * 1) Centered Nav: [data-navigation-toggle="toggle"], [data-navigation-toggle="close"]
 *    [data-navigation-status] active/not-active. ESC closes.
 * 2) Nav Contrast: Add .nav--over-light to .navigation_container when over light sections.
 *    At top: uses data-wf--navigation--variant — "base" = header with images (white text),
 *    "variant" = header with white bg (dark text).
 * 3) Scroll Background: Add .nav--scrolled to .navigation when user scrolls down.
 * 4) Scroll Hide/Show: Add .nav--hidden when scrolling down, remove when scrolling up.
 * Text colors: CSS only (nav--over-light, nav--scrolled, data-navigation-status).
 *
 * DEBUG: ?nav_debug=1 or window.NAV_CONTRAST_DEBUG = true
 */
(function() {
  'use strict';

  // ===== 1) Centered Scaling Navigation Bar =====
  function initCenteredScalingNavigationBar() {
    const navigationInnerItems = document.querySelectorAll('[data-navigation-item]');
    navigationInnerItems.forEach((item, index) => {
      item.style.transitionDelay = `${index * 0.05}s`;
    });

    document.querySelectorAll('[data-navigation-toggle="toggle"]').forEach(toggleBtn => {
      toggleBtn.addEventListener('click', () => {
        const navStatusEl = document.querySelector('[data-navigation-status]');
        if (!navStatusEl) return;
        if (navStatusEl.getAttribute('data-navigation-status') === 'not-active') {
          navStatusEl.setAttribute('data-navigation-status', 'active');
        } else {
          navStatusEl.setAttribute('data-navigation-status', 'not-active');
        }
      });
    });

    document.querySelectorAll('[data-navigation-toggle="close"]').forEach(closeBtn => {
      closeBtn.addEventListener('click', () => {
        const navStatusEl = document.querySelector('[data-navigation-status]');
        if (!navStatusEl) return;
        navStatusEl.setAttribute('data-navigation-status', 'not-active');
      });
    });

    document.addEventListener('keydown', e => {
      if (e.keyCode === 27) {
        const navStatusEl = document.querySelector('[data-navigation-status]');
        if (!navStatusEl) return;
        if (navStatusEl.getAttribute('data-navigation-status') === 'active') {
          navStatusEl.setAttribute('data-navigation-status', 'not-active');
        }
      }
    });
  }

  // ===== 2) Nav Contrast (logo/menu color by section) =====
  const LIGHT_SECTIONS = '.background-color-white, .background-color-primary, .color-scheme-1, .section_solutions, .section_about-us, .section_product-header, [data-nav-contrast="light"]';
  const NAV_CONTRAST_DEBUG = !!(window.NAV_CONTRAST_DEBUG || /[?&]nav_debug=1/.test(location.search));
  const VARIANT_AT_TOP_LIGHT = ['variant', 'dark']; /* Pages with white header: dark text at top */

  function navContrastDebug(...args) {
    if (NAV_CONTRAST_DEBUG) console.log('[Nav Contrast]', ...args);
  }

  function initNavContrast() {
    const nav = document.querySelector('.navigation_container');
    const navWrapper = document.querySelector('.navigation');
    if (!nav) {
      navContrastDebug('Nav not found (.navigation_container)');
      return;
    }

    const lightSections = document.querySelectorAll(LIGHT_SECTIONS);
    const navHeight = 80;
    const options = {
      root: null,
      rootMargin: `-${navHeight}px 0px 0px 0px`,
      threshold: [0, 0.01, 0.5, 1]
    };

    let isOverLight = false;

    const callback = (entries) => {
      const overLight = entries.some(e => e.isIntersecting);
      if (overLight !== isOverLight) {
        isOverLight = overLight;
        nav.classList.toggle('nav--over-light', isOverLight);
      }
    };

    if (lightSections.length) {
      const observer = new IntersectionObserver(callback, options);
      lightSections.forEach(section => observer.observe(section));
    }

    const variant = navWrapper?.getAttribute('data-wf--navigation--variant') || 'base';
    const atTopNeedsLight = VARIANT_AT_TOP_LIGHT.includes(variant);

    const checkUnderNav = () => {
      if (document.querySelector('[data-navigation-status="active"]') || document.querySelector('[data-modal-group-status="active"]')) return isOverLight;
      const scrollY = getScrollY();
      const atTop = scrollY < 80;
      if (atTop && atTopNeedsLight) {
        if (!isOverLight) {
          isOverLight = true;
          nav.classList.add('nav--over-light');
        }
        return true;
      }
      const rect = nav.getBoundingClientRect();
      const headerBarHeight = 60;
      const checkY = rect.top + headerBarHeight + 2;
      const centerX = window.innerWidth / 2;
      const elAtPoint = document.elementFromPoint(centerX, checkY);
      const inLightSection = elAtPoint?.closest(LIGHT_SECTIONS);
      const shouldBeLight = !!inLightSection;
      if (shouldBeLight !== isOverLight) {
        isOverLight = shouldBeLight;
        nav.classList.toggle('nav--over-light', isOverLight);
      }
      return shouldBeLight;
    };

    checkUnderNav();
    window.addEventListener('load', () => { checkUnderNav(); });

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

    const navStatusEl = document.querySelector('[data-navigation-status]');
    if (navStatusEl) {
      const obs = new MutationObserver(() => { if (navStatusEl.getAttribute('data-navigation-status') !== 'active') checkUnderNav(); });
      obs.observe(navStatusEl, { attributes: true, attributeFilter: ['data-navigation-status'] });
    }
    const modalGroupEl = document.querySelector('[data-modal-group-status]');
    if (modalGroupEl) {
      const obsModal = new MutationObserver(() => { if (modalGroupEl.getAttribute('data-modal-group-status') !== 'active') checkUnderNav(); });
      obsModal.observe(modalGroupEl, { attributes: true, attributeFilter: ['data-modal-group-status'] });
    }
  }

  // ===== 3) Nav Scroll Background =====
  const SCROLL_THRESHOLD = 60;

  function getScrollY() {
    if (typeof window === 'undefined') return 0;
    const ls = window.locomotiveScroll || window.scroll?.locomotive;
    if (ls && ls.lenis && typeof ls.lenis.scroll === 'number') return ls.lenis.scroll;
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function initNavScrollBackground() {
    const nav = document.querySelector('.navigation');
    if (!nav) return;

    let isScrolled = false;

    const update = () => {
      const scrollY = getScrollY();
      const shouldBeScrolled = scrollY > SCROLL_THRESHOLD;
      if (shouldBeScrolled !== isScrolled) {
        isScrolled = shouldBeScrolled;
        nav.classList.toggle('nav--scrolled', isScrolled);
      }
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('load', update);

    const hookLenis = () => {
      const ls = window.locomotiveScroll || window.scroll?.locomotive;
      if (ls && ls.lenis) {
        ls.lenis.on('scroll', update);
        return true;
      }
      return false;
    };
    if (!hookLenis()) {
      document.addEventListener('DOMContentLoaded', () => hookLenis());
      setTimeout(() => hookLenis(), 1500);
    }
  }

  // ===== 4) Nav Scroll Hide/Show =====
  const SCROLL_HIDE_TOP_THRESHOLD = 80;
  const SCROLL_HIDE_DELTA = 50;

  function initNavScrollHide() {
    const nav = document.querySelector('.navigation');
    if (!nav) return;

    let lastScrollY = getScrollY();
    let isHidden = false;

    const update = () => {
      if (document.querySelector('[data-navigation-status="active"]')) return;

      const scrollY = getScrollY();

      if (scrollY <= SCROLL_HIDE_TOP_THRESHOLD) {
        if (isHidden) {
          isHidden = false;
          nav.classList.remove('nav--hidden');
        }
        lastScrollY = scrollY;
        return;
      }

      const delta = scrollY - lastScrollY;

      if (delta > SCROLL_HIDE_DELTA) {
        lastScrollY = scrollY;
        if (!isHidden) {
          isHidden = true;
          nav.classList.add('nav--hidden');
        }
      } else if (delta < -SCROLL_HIDE_DELTA) {
        lastScrollY = scrollY;
        if (isHidden) {
          isHidden = false;
          nav.classList.remove('nav--hidden');
        }
      }
    };

    let scrollTicking = false;
    const onScroll = () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        update();
        scrollTicking = false;
      });
    };

    lastScrollY = getScrollY();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', () => { lastScrollY = getScrollY(); });

    const hookLenis = () => {
      const ls = window.locomotiveScroll || window.scroll?.locomotive;
      if (ls && ls.lenis) {
        ls.lenis.on('scroll', () => {
          requestAnimationFrame(update);
        });
        return true;
      }
      return false;
    };
    if (!hookLenis()) {
      document.addEventListener('DOMContentLoaded', () => hookLenis());
      setTimeout(() => hookLenis(), 1500);
    }
  }

  // ===== Init =====
  function init() {
    initCenteredScalingNavigationBar();
    initNavContrast();
    initNavScrollBackground();
    initNavScrollHide();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
