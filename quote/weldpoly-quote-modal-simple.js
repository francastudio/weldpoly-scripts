(function() {
  'use strict';

  // ===== SIMPLE MODAL HANDLER =====
  
  // Open modal
  function openQuoteModal() {
    const modalGroup = document.querySelector('[data-modal-group-status]');
    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    
    if (modalGroup) {
      modalGroup.setAttribute('data-modal-group-status', 'active');
    }
    
    if (quoteModal) {
      quoteModal.setAttribute('data-modal-status', 'active');
    }
  }
  
  // Close modal
  function closeQuoteModal() {
    const modalGroup = document.querySelector('[data-modal-group-status]');
    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    
    if (modalGroup) {
      modalGroup.setAttribute('data-modal-group-status', 'not-active');
    }
    
    if (quoteModal) {
      quoteModal.setAttribute('data-modal-status', 'not-active');
    }
  }
  
  // Initialize modal handlers
  function initModalHandlers() {
    // Open modal: elements with data-modal-target="quote-modal"
    document.addEventListener('click', function(e) {
      const openBtn = e.target.closest('[data-modal-target="quote-modal"]');
      if (openBtn) {
        e.preventDefault();
        openQuoteModal();
      }
    });
    
    // Close modal: elements with class "modal__btn-close"
    document.addEventListener('click', function(e) {
      const closeBtn = e.target.closest('.modal__btn-close');
      if (closeBtn) {
        e.preventDefault();
        closeQuoteModal();
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalHandlers);
  } else {
    initModalHandlers();
  }
  
  // Also initialize after Webflow loads
  if (typeof Webflow !== 'undefined') {
    Webflow.push(function() {
      initModalHandlers();
    });
  }
})();
