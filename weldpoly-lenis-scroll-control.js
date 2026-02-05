/**
 * Weldpoly Lenis Scroll Control
 * 
 * System to enable/disable scroll in specific sections using Lenis Scroll.
 * 
 * INSTRUCTIONS:
 * 1. Add this script after Lenis Scroll is loaded
 * 2. Use data attributes to control scroll:
 *    - data-lenis-scroll="disabled" - Disable scroll in this section
 *    - data-lenis-scroll="enabled" - Enable scroll in this section (default)
 * 3. Or use JavaScript functions for dynamic control
 * 
 * HTML EXAMPLE:
 * <section data-lenis-scroll="disabled">
 *   Content without scroll
 * </section>
 * 
 * <div data-lenis-scroll="enabled">
 *   Content with scroll
 * </div>
 */

(function() {
  'use strict';

  let lenisInstance = null;
  let scrollControlInitialized = false;
  const disabledSections = new WeakSet();
  const scrollHandlers = new WeakMap();

  /**
   * Get Lenis instance from various possible locations
   */
  function getLenisInstance() {
    if (lenisInstance) return lenisInstance;
    
    // Try different ways to find Lenis instance
    if (typeof window.Lenis !== 'undefined' && window.lenis) {
      lenisInstance = window.lenis;
    } else if (window.scroll && window.scroll.lenis) {
      lenisInstance = window.scroll.lenis;
    } else if (typeof window.LocomotiveScroll !== 'undefined') {
      // Locomotive Scroll V5 uses Lenis
      const locomotiveInstance = window.locomotiveScroll || window.scroll?.locomotive;
      if (locomotiveInstance && locomotiveInstance.lenis) {
        lenisInstance = locomotiveInstance.lenis;
      }
    }
    
    return lenisInstance;
  }

  /**
   * Disable scroll for a specific element
   */
  function disableScrollForElement(element) {
    if (!element || disabledSections.has(element)) return;
    
    disabledSections.add(element);
    
    // Create scroll prevention handlers
    const wheelHandler = function(e) {
      // Check if scroll event originated from this element or its children
      if (element.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    
    const touchHandler = function(e) {
      if (element.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    
    // Store handlers for later removal
    scrollHandlers.set(element, { wheel: wheelHandler, touch: touchHandler });
    
    // Add event listeners with capture phase to catch events early
    element.addEventListener('wheel', wheelHandler, { passive: false, capture: true });
    element.addEventListener('touchmove', touchHandler, { passive: false, capture: true });
    
    // Also prevent scroll on the element itself
    element.style.overflow = 'hidden';
    element.style.overscrollBehavior = 'none';
  }

  /**
   * Enable scroll for a specific element
   */
  function enableScrollForElement(element) {
    if (!element || !disabledSections.has(element)) return;
    
    disabledSections.delete(element);
    
    // Remove event listeners
    const handlers = scrollHandlers.get(element);
    if (handlers) {
      element.removeEventListener('wheel', handlers.wheel, { capture: true });
      element.removeEventListener('touchmove', handlers.touch, { capture: true });
      scrollHandlers.delete(element);
    }
    
    // Restore scroll styles
    element.style.overflow = '';
    element.style.overscrollBehavior = '';
  }

  /**
   * Initialize scroll control for elements with data attributes
   */
  function initScrollControl() {
    // Find all elements with data-lenis-scroll attribute
    const elements = document.querySelectorAll('[data-lenis-scroll]');
    
    elements.forEach(element => {
      const scrollSetting = element.getAttribute('data-lenis-scroll');
      
      if (scrollSetting === 'disabled') {
        disableScrollForElement(element);
      } else if (scrollSetting === 'enabled') {
        enableScrollForElement(element);
      }
    });
  }

  /**
   * Watch for dynamically added elements
   */
  function watchForNewElements() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Check if the added node has the attribute
            if (node.hasAttribute && node.hasAttribute('data-lenis-scroll')) {
              const scrollSetting = node.getAttribute('data-lenis-scroll');
              if (scrollSetting === 'disabled') {
                disableScrollForElement(node);
              }
            }
            
            // Check children of added node
            const children = node.querySelectorAll ? node.querySelectorAll('[data-lenis-scroll]') : [];
            children.forEach(child => {
              const scrollSetting = child.getAttribute('data-lenis-scroll');
              if (scrollSetting === 'disabled') {
                disableScrollForElement(child);
              }
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Public API - Disable scroll for element
   */
  window.disableLenisScroll = function(selector) {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
    
    if (element) {
      disableScrollForElement(element);
      element.setAttribute('data-lenis-scroll', 'disabled');
    }
  };

  /**
   * Public API - Enable scroll for element
   */
  window.enableLenisScroll = function(selector) {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
    
    if (element) {
      enableScrollForElement(element);
      element.setAttribute('data-lenis-scroll', 'enabled');
    }
  };

  /**
   * Public API - Toggle scroll for element
   */
  window.toggleLenisScroll = function(selector) {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
    
    if (!element) return;
    
    const isDisabled = disabledSections.has(element);
    if (isDisabled) {
      window.enableLenisScroll(element);
    } else {
      window.disableLenisScroll(element);
    }
  };

  /**
   * Public API - Check if scroll is disabled for element
   */
  window.isLenisScrollDisabled = function(selector) {
    const element = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
    
    return element ? disabledSections.has(element) : false;
  };

  /**
   * Initialize on DOM ready
   */
  function init() {
    if (scrollControlInitialized) return;
    scrollControlInitialized = true;
    
    // Wait for Lenis to be available
    const checkLenis = setInterval(() => {
      if (getLenisInstance() || document.readyState === 'complete') {
        clearInterval(checkLenis);
        initScrollControl();
        watchForNewElements();
      }
    }, 100);
    
    // Also initialize immediately if DOM is ready
    if (document.readyState !== 'loading') {
      initScrollControl();
      watchForNewElements();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Initialize after Webflow loads
  if (typeof Webflow !== 'undefined') {
    Webflow.push(function() {
      if (!scrollControlInitialized) {
        init();
      }
    });
  }

})();
