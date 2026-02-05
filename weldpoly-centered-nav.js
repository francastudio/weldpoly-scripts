/**
 * Weldpoly Centered Scaling Navigation Bar
 * Toggle navigation menu and close on ESC
 */
(function() {
  'use strict';

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCenteredScalingNavigationBar);
  } else {
    initCenteredScalingNavigationBar();
  }
})();
