/**
 * Weldpoly Quote System - Unified Script
 * 
 * Este script gerencia o sistema completo de quote (carrinho de cotação) e modal do Webflow.
 * Ele unifica o gerenciamento do carrinho, renderização e controle do modal.
 * 
 * INSTRUÇÕES:
 * 1. Copie TODO o conteúdo deste arquivo
 * 2. No Webflow: Site Settings → Custom Code → Footer Code
 * 3. Cole este script PRIMEIRO
 * 4. Depois cole o script de spare parts (weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js)
 */

(function() {
  'use strict';

  let systemInitialized = false; // Prevent duplicate initialization

  function initQuoteSystem() {
    // Prevent duplicate initialization
    if (systemInitialized) return;
    systemInitialized = true;

    const modalGroup = document.querySelector('[data-modal-group-status]');
    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    const quoteContent = quoteModal?.querySelector('.quote_modal-content');
    const templateItem = quoteModal?.querySelector('[data-quote-item]');
    const titleEl = quoteModal?.querySelector('.quote_header-title');
    const emptyState = quoteModal?.querySelector('[quote-empty]');
    const actionsBlock = quoteModal?.querySelector('.quote_modal-content-bottom');
    let cart = [];

    // ===== Utilidades =====
    function saveCart() {
      localStorage.setItem('quoteCart', JSON.stringify(cart));
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

    // ===== Botão Submit do Modal → Redirecionar =====
    const modalSubmitBtn = document.querySelector("[data-quote-modal-submit]");
    if (modalSubmitBtn) {
      modalSubmitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/get-a-quote";
      });
    }

    function loadCart() {
      const saved = localStorage.getItem('quoteCart');
      if (saved) {
        try {
          cart = JSON.parse(saved);
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

    // ===== Renderizar conteúdo =====
    function renderCart() {
      if (!quoteContent || !templateItem) return;
      quoteContent.querySelectorAll('.quote_item:not([style*="display: none"])').forEach(el => el.remove());
      cart.forEach((item, index) => {
        const clone = templateItem.cloneNode(true);
        clone.style.display = 'flex';
        
        // Preenche dados - com verificação de null
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

    // ===== Locomotive Scroll Integration =====
    function setupModalScroll() {
      if (!quoteContent) return;
      
      // Enable vertical scroll inside modal content
      quoteContent.style.overflowY = 'auto';
      quoteContent.style.overflowX = 'hidden';
      quoteContent.style.WebkitOverflowScrolling = 'touch'; // Smooth scroll on iOS
      
      // Calculate max height based on viewport minus header and actions
      // Header + Actions typically take ~200-250px, leaving space for content
      const maxHeight = window.innerHeight - 250;
      quoteContent.style.maxHeight = maxHeight + 'px';
      
      // Prevent Locomotive Scroll from interfering with modal scroll
      quoteContent.setAttribute('data-locomotive-scroll', 'ignore');
      quoteContent.setAttribute('data-scroll-container', 'true');
      
      // Add class for CSS targeting if needed
      quoteContent.classList.add('quote-modal-scrollable');
    }

    function handleLocomotiveScroll(modalOpen) {
      // Pause Locomotive Scroll when modal is open
      if (typeof window.LocomotiveScroll !== 'undefined') {
        // Try to find locomotive instance
        const locomotiveInstance = window.locomotiveScroll || 
                                   (window.scroll && window.scroll.locomotive) ||
                                   document.querySelector('[data-scroll-container]')?.__locomotiveScroll;
        
        if (locomotiveInstance) {
          if (modalOpen) {
            locomotiveInstance.stop();
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
          } else {
            locomotiveInstance.start();
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
          }
        }
      }
      
      // Also handle Lenis (Locomotive V5 is based on Lenis)
      if (typeof window.Lenis !== 'undefined') {
        const lenisInstance = window.lenis || 
                             (window.scroll && window.scroll.lenis);
        
        if (lenisInstance) {
          if (modalOpen) {
            lenisInstance.stop();
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
          } else {
            lenisInstance.start();
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
          }
        }
      }
    }

    // ===== Modal Control =====
    function openQuoteModal() {
      if (modalGroup) modalGroup.setAttribute('data-modal-group-status', 'active');
      if (quoteModal) quoteModal.setAttribute('data-modal-status', 'active');
      
      // Setup scroll for modal content
      setupModalScroll();
      
      // Pause Locomotive Scroll
      handleLocomotiveScroll(true);
      
      // Re-render cart when modal opens to ensure it's up to date
      renderCart();
    }

    function closeQuoteModal() {
      if (modalGroup) modalGroup.setAttribute('data-modal-group-status', 'not-active');
      if (quoteModal) quoteModal.setAttribute('data-modal-status', 'not-active');
      
      // Resume Locomotive Scroll
      handleLocomotiveScroll(false);
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

    // ===== Botões Add to Quote (direct) =====
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
    // Watch for modal status changes to handle scroll
    if (quoteModal) {
      const modalObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-modal-status') {
            const isActive = quoteModal.getAttribute('data-modal-status') === 'active';
            if (isActive) {
              setupModalScroll();
              handleLocomotiveScroll(true);
            } else {
              handleLocomotiveScroll(false);
            }
          }
        });
      });
      
      modalObserver.observe(quoteModal, {
        attributes: true,
        attributeFilter: ['data-modal-status']
      });
    }

    // ===== Inicialização =====
    loadCart();
    renderCart();
    updateNavQty();
    
    // Setup modal scroll on init (in case modal is already open)
    if (quoteModal && quoteModal.getAttribute('data-modal-status') === 'active') {
      setupModalScroll();
      handleLocomotiveScroll(true);
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
