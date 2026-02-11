/**
 * Weldpoly Quote System - Unified Script
 * 
 * This script manages the complete quote system (quote cart) and modal in Webflow.
 * It unifies cart management, rendering, and modal control.
 * 
 * INSTRUCTIONS:
 * 1. Copy ALL content from this file
 * 2. In Webflow: Site Settings → Custom Code → Footer Code
 * 3. Paste this script FIRST
 * 4. Then paste the spare parts script (weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js)
 */

(function() {
  'use strict';

  console.log('[Weldpoly] Quote System loaded — cart, quote modal, add product to quote');
  let systemInitialized = false; // Prevent duplicate initialization

  function initQuoteSystem() {
    // Prevent duplicate initialization
    if (systemInitialized) return;
    systemInitialized = true;

    const modalGroup = document.querySelector('[data-modal-group-status]');
    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    const quoteContent = quoteModal?.querySelector('.quote_modal-content');
    const templateItem = quoteModal?.querySelector('[data-quote-item]');
    const templatePartItem = quoteModal?.querySelector('[data-quote-part-item]');
    const titleEl = quoteModal?.querySelector('.quote_header-title');
    const emptyState = quoteModal?.querySelector('[quote-empty]');
    const actionsBlock = quoteModal?.querySelector('.quote_modal-content-bottom');
    let cart = [];

    // ===== Utilities =====
    function saveCart() {
      localStorage.setItem('quoteCart', JSON.stringify(cart));
      try { localStorage.setItem('quoteCartSavedAt', String(Date.now())); } catch (_) {}
      try { document.dispatchEvent(new CustomEvent('quoteCartUpdated')); } catch (_) {}
    }

    const navQty = document.querySelector("[data-nav-quote-qty]");
    function updateNavQty() {
      if (!navQty) return;
      if (cart.length === 0) {
        navQty.style.display = "none";
        navQty.textContent = "";
      } else {
        navQty.style.display = "flex";
        navQty.textContent = cart.length;
      }
    }

    // ===== Modal Submit Button → Redirect =====
    const modalSubmitBtn = document.querySelector("[data-quote-modal-submit]");
    if (modalSubmitBtn) {
      modalSubmitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/get-a-quote";
      });
    }

    function mergeDuplicateSpareParts(arr) {
      const norm = s => (s || '').trim().toLowerCase();
      const seen = [];
      const result = [];
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (!item.isSparePart) { result.push(item); continue; }
        const key = norm(item.title) + '\n' + norm(item.parentProductTitle || '');
        const idx = seen.indexOf(key);
        if (idx >= 0) { result[idx].qty = (result[idx].qty || 1) + (item.qty || 1); }
        else { seen.push(key); result.push({ ...item, qty: item.qty || 1 }); }
      }
      return result;
    }

    function loadCart() {
      const saved = localStorage.getItem('quoteCart');
      if (saved) {
        try {
          cart = mergeDuplicateSpareParts(JSON.parse(saved));
        } catch {
          cart = [];
        }
      }
    }

    function updateTitle() {
      if (titleEl) {
        titleEl.textContent = `QUOTE (${cart.length} ${cart.length === 1 ? 'ITEM' : 'ITEMS'})`;
      }
    }

    function toggleEmptyState() {
      if (!emptyState || !actionsBlock) return;
      if (cart.length === 0) {
        emptyState.style.display = "flex";
        actionsBlock.style.display = "none";
      } else {
        emptyState.style.display = "none";
        actionsBlock.style.display = "block";
      }
    }

    // ===== Render content =====
    function renderCart() {
      if (!quoteContent || !templateItem) return;
      templateItem.style.display = 'none';
      if (templatePartItem) templatePartItem.style.display = 'none';
      quoteContent.querySelectorAll('.quote_item, .quote_part-item').forEach(el => {
        if (!el.hasAttribute('data-quote-item') && !el.hasAttribute('data-quote-part-item')) el.remove();
      });
      const templateProduct = templateItem;
      const templatePart = templatePartItem || templateItem;
      cart.forEach((item, index) => {
        const isSparePart = item.isSparePart === true;
        const template = isSparePart ? templatePart : templateProduct;
        const clone = template.cloneNode(true);
        clone.style.display = 'flex';
        clone.removeAttribute('data-quote-item');
        clone.removeAttribute('data-quote-part-item');
        if (isSparePart) clone.classList.add('quote_part-item');
        
        // Fill data - with null check
        const titleEl = clone.querySelector('[data-quote-title]');
        const descEl = clone.querySelector('[data-quote-description]');
        const qtyEl = clone.querySelector('[data-quote-number]');
        
        if (titleEl) titleEl.textContent = item.title || '';
        if (descEl) descEl.textContent = item.description || '';
        if (qtyEl) {
          qtyEl.textContent = item.qty || 1;
          const nestedDiv = qtyEl.querySelector('div');
          if (nestedDiv) nestedDiv.textContent = item.qty || 1;
        }
        
        const imgEl = clone.querySelector('[data-quote-image]');
        if (imgEl) imgEl.remove();
        
        // Controles
        const plusBtn = clone.querySelector('.quote_plus');
        const minusBtn = clone.querySelector('.quote_minus');
        const removeBtn = clone.querySelector('[data-quote-remove]');
        
        if (plusBtn) {
          plusBtn.addEventListener('click', () => {
            item.qty++;
            renderCart();
            saveCart();
            updateNavQty();
          });
        }
        
        if (minusBtn) {
          minusBtn.addEventListener('click', () => {
            if (item.qty > 1) item.qty--;
            renderCart();
            saveCart();
            updateNavQty();
          });
        }
        
        if (removeBtn) {
          removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cart.splice(index, 1);
            renderCart();
            saveCart();
            updateNavQty();
          });
        }
        
        quoteContent.appendChild(clone);
      });
      updateTitle();
      toggleEmptyState();
    }

    // ===== Request-a-Quote Page List ([data-quote-list] on /get-a-quote) =====
    const pageListContainer = document.querySelector('[data-quote-list]');
    const pageTitleEl = document.querySelector('[data-request-a-quote-title]');
    const pageTemplate = pageListContainer?.querySelector('[data-quote-placeholder]') || pageListContainer?.querySelector('[data-quote-item]');

    function renderRequestQuotePageList() {
      if (!pageListContainer || !pageTemplate) return;
      pageTemplate.style.display = 'none';
      pageListContainer.querySelectorAll('.quote_item, .quote_part-item').forEach(el => {
        if (!el.hasAttribute('data-quote-placeholder') && !el.hasAttribute('data-quote-item')) el.remove();
      });
      cart.forEach((item, index) => {
        const clone = pageTemplate.cloneNode(true);
        clone.style.display = 'flex';
        clone.removeAttribute('data-quote-placeholder');
        clone.removeAttribute('data-quote-item');
        const tEl = clone.querySelector('[data-quote-title]');
        const dEl = clone.querySelector('[data-quote-description]');
        const qEl = clone.querySelector('[data-quote-number]');
        if (tEl) tEl.textContent = item.title || '';
        if (dEl) dEl.textContent = item.description || '';
        if (qEl) {
          const q = item.qty || 1;
          qEl.textContent = q;
          const inner = qEl.querySelector('div');
          if (inner) inner.textContent = q;
        }
        const plusBtn = clone.querySelector('.quote_plus');
        const minusBtn = clone.querySelector('.quote_minus');
        const removeBtn = clone.querySelector('[data-quote-remove]');
        if (plusBtn) plusBtn.addEventListener('click', () => { item.qty++; saveCart(); renderCart(); renderRequestQuotePageList(); updateNavQty(); });
        if (minusBtn) minusBtn.addEventListener('click', () => { if (item.qty > 1) item.qty--; saveCart(); renderCart(); renderRequestQuotePageList(); updateNavQty(); });
        if (removeBtn) removeBtn.addEventListener('click', (e) => { e.preventDefault(); cart.splice(index, 1); saveCart(); renderCart(); renderRequestQuotePageList(); updateNavQty(); });
        pageListContainer.appendChild(clone);
      });
      if (pageTitleEl) pageTitleEl.textContent = `QUOTE (${cart.length} ${cart.length === 1 ? 'ITEM' : 'ITEMS'})`;
    }

    // ===== Locomotive Scroll Integration =====
    function setupModalScroll() {
      if (!quoteContent) return;
      
      // Enable vertical scroll ONLY inside modal content
      quoteContent.style.overflowY = 'auto';
      quoteContent.style.overflowX = 'hidden';
      quoteContent.style.WebkitOverflowScrolling = 'touch';
      
      // Calculate max height based on viewport minus header and actions
      const modalCard = quoteModal?.querySelector('.modal__card') || quoteModal;
      if (modalCard) {
        const headerHeight = quoteModal?.querySelector('.quote_header')?.offsetHeight || 0;
        const actionsHeight = quoteModal?.querySelector('.quote_modal-content-bottom')?.offsetHeight || 0;
        const padding = 40;
        
        const maxHeight = window.innerHeight - headerHeight - actionsHeight - padding;
        quoteContent.style.maxHeight = maxHeight + 'px';
      }
      
      // Prevent Locomotive Scroll from interfering with modal scroll
      quoteContent.setAttribute('data-locomotive-scroll', 'ignore');
      quoteContent.setAttribute('data-scroll', 'ignore');
      
      // Add class for CSS targeting
      quoteContent.classList.add('quote-modal-scrollable');
    }

    // ===== Scroll Control Integration =====
    function handleModalScrollControl(modalOpen) {
      // Wait for scroll control to be available
      if (typeof window.disableLenisScroll !== 'function' || 
          typeof window.enableLenisScroll !== 'function') {
        // Retry after a short delay
        setTimeout(() => handleModalScrollControl(modalOpen), 100);
        return;
      }

      if (modalOpen) {
        // Disable scroll on body/page when modal is open
        const body = document.body;
        const html = document.documentElement;
        
        // Disable scroll on body and html
        window.disableLenisScroll(body);
        window.disableLenisScroll(html);
        
        // Enable scroll only in quote content wrapper
        if (quoteContent) {
          // Remove disabled attribute if exists
          quoteContent.removeAttribute('data-lenis-scroll');
          // Ensure scroll is enabled in content
          quoteContent.style.overflowY = 'auto';
          quoteContent.style.overflowX = 'hidden';
        }
      } else {
        // Enable scroll on body/page when modal closes
        const body = document.body;
        const html = document.documentElement;
        
        window.enableLenisScroll(body);
        window.enableLenisScroll(html);
      }
    }

    // ===== Modal Control =====
    function openQuoteModal() {
      if (modalGroup) modalGroup.setAttribute('data-modal-group-status', 'active');
      if (quoteModal) quoteModal.setAttribute('data-modal-status', 'active');
      
      // Setup scroll for modal content
      setupModalScroll();
      
      // Disable page scroll, enable only in modal content
      handleModalScrollControl(true);
      
      // Re-render cart when modal opens to ensure it's up to date
      renderCart();
    }

    function closeQuoteModal() {
      if (modalGroup) modalGroup.setAttribute('data-modal-group-status', 'not-active');
      if (quoteModal) quoteModal.setAttribute('data-modal-status', 'not-active');
      
      // Re-enable page scroll
      handleModalScrollControl(false);
    }

    // Expose globally for other scripts
    window.openQuoteModal = openQuoteModal;
    window.closeQuoteModal = closeQuoteModal;

    // ===== Add Product to Cart =====
    function addProductToCart(button) {
      const title = button.getAttribute('data-quote-title') || 'Unnamed item';
      const description = button.getAttribute('data-quote-description') || '';
      
      const existing = cart.find(i => i.title === title);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ title, description, qty: 1 });
      }
      
      renderCart();
      saveCart();
      updateNavQty();
    }

    // ===== Modal Handlers =====
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
    
    // Close modal: elements with class "modal__btn-close" OR data-modal-close attribute
    document.addEventListener('click', function(e) {
      const closeBtn = e.target.closest('.modal__btn-close, [data-modal-close]');
      if (closeBtn) {
        e.preventDefault();
        closeQuoteModal();
      }
    });

    // ===== Add to Quote buttons (direct) =====
    document.querySelectorAll('[data-add-quote]').forEach(btn => {
      // Skip if button also has data-modal-target (already handled above)
      if (btn.hasAttribute('data-modal-target')) return;
      
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        addProductToCart(btn);
        openQuoteModal();
      });
    });

    // ===== Modal Scroll Observer =====
    // Watch for modal status changes to setup scroll
    if (quoteModal) {
      const modalObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-modal-status') {
            const isActive = quoteModal.getAttribute('data-modal-status') === 'active';
            setTimeout(() => {
              if (isActive) {
                setupModalScroll();
                handleModalScrollControl(true);
              } else {
                handleModalScrollControl(false);
              }
            }, 50);
          }
        });
      });
      
      modalObserver.observe(quoteModal, {
        attributes: true,
        attributeFilter: ['data-modal-status']
      });
    }

    // ===== Cart expiry (e.g. spare parts script clears after 1h) =====
    document.addEventListener('quoteCartExpired', function () {
      loadCart();
      renderCart();
      renderRequestQuotePageList();
      updateNavQty();
    });

    document.addEventListener('quoteCartUpdated', function () {
      loadCart();
      renderCart();
      renderRequestQuotePageList();
      updateNavQty();
    });

    // ===== Initialization =====
    loadCart();
    renderCart();
    renderRequestQuotePageList();
    updateNavQty();
    
    // Setup modal scroll on init (in case modal is already open)
    if (quoteModal && quoteModal.getAttribute('data-modal-status') === 'active') {
      setupModalScroll();
      handleModalScrollControl(true);
    }
  }

  // Expose globally
  window.initQuoteSystem = initQuoteSystem;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuoteSystem);
  } else {
    initQuoteSystem();
  }

  // Initialize after Webflow loads
  if (typeof Webflow !== 'undefined') {
    Webflow.push(function() {
      if (!systemInitialized) {
        initQuoteSystem();
      }
    });
  }
})();
