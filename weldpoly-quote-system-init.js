/**
 * Weldpoly Quote System - Init Script
 * 
 * Este script gerencia o sistema de quote (carrinho de cotação) do Webflow.
 * Ele deve ser adicionado ANTES do script de spare parts no footer code.
 * 
 * INSTRUÇÕES:
 * 1. Copie TODO o conteúdo deste arquivo
 * 2. No Webflow: Site Settings → Custom Code → Footer Code
 * 3. Cole este script PRIMEIRO
 * 4. Depois cole o script de spare parts (weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js)
 */

(function() {
  'use strict';

  function initQuoteSystem() {
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

    // ===== Abrir modal =====
    function openQuoteModal() {
      if (modalGroup) modalGroup.setAttribute('data-modal-group-status', 'active');
      if (quoteModal) quoteModal.setAttribute('data-modal-status', 'active');
    }

    // ===== Botões Add to Quote =====
    document.querySelectorAll('[data-add-quote]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const title = btn.getAttribute('data-quote-title') || 'Unnamed item';
        const description = btn.getAttribute('data-quote-description') || '';
        const existing = cart.find(i => i.title === title);
        if (existing) {
          existing.qty++;
        } else {
          cart.push({ title, description, qty: 1 });
        }
        renderCart();
        saveCart();
        updateNavQty();
        openQuoteModal();
      });
    });

    // ===== Inicialização =====
    loadCart();
    renderCart();
    updateNavQty();
  }

  // Expor globalmente
  window.initQuoteSystem = initQuoteSystem;

  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuoteSystem);
  } else {
    initQuoteSystem();
  }

  // Inicializar após Webflow carregar
  if (typeof Webflow !== 'undefined') {
    Webflow.push(function() {
      setTimeout(initQuoteSystem, 100);
    });
  }
})();
