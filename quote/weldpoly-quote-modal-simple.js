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
        
        // If button has data-add-quote, add product to cart first
        if (openBtn.hasAttribute('data-add-quote')) {
          addProductToCart(openBtn);
        }
        
        // Then open the modal
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
  
  // Add product to cart
  function addProductToCart(button) {
    const title = button.getAttribute('data-quote-title') || 'Unnamed item';
    const description = button.getAttribute('data-quote-description') || '';
    
    // Get existing cart from localStorage
    let cart = [];
    try {
      const saved = localStorage.getItem('quoteCart');
      if (saved) {
        cart = JSON.parse(saved);
      }
    } catch (e) {
      console.log('Error loading cart:', e);
    }
    
    // Check if product already exists in cart
    const existing = cart.find(item => item.title === title);
    
    if (existing) {
      // Increase quantity if product exists
      existing.qty++;
    } else {
      // Add new product to cart
      cart.push({
        title: title,
        description: description,
        qty: 1
      });
    }
    
    // Save cart to localStorage
    try {
      localStorage.setItem('quoteCart', JSON.stringify(cart));
      console.log('Product added to cart:', title);
    } catch (e) {
      console.log('Error saving cart:', e);
    }
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
