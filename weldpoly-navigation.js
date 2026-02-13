/**
 * Weldpoly Navigation — Unified script
 * Only acts on scroll or menu open. Initial state: component CSS (variants).
 *
 * 1) Centered Nav: [data-navigation-toggle="toggle"], [data-navigation-toggle="close"]
 *    [data-navigation-status] active/not-active. ESC closes.
 * 2) Scroll Background: Add .nav--scrolled to .navigation when user scrolls down.
 * 3) Scroll Hide/Show: Add .nav--hidden when scrolling down, remove when scrolling up.
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

  // ===== 2) Nav Scroll Background =====
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

  // ===== 3) Nav Scroll Hide/Show =====
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
    initNavScrollBackground();
    initNavScrollHide();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
