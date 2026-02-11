/**
 * Weldpoly Quote System — Unified (Quote + Spare Parts)
 *
 * Single script for quote cart, modal, and spare parts add-to-quote.
 * Load once from CDN — no separate spare parts script needed.
 *
 * INSTRUCTIONS:
 * 1. In Webflow: Site Settings → Custom Code → Footer Code
 * 2. Add: <script src="https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-quote-system.js" defer></script>
 */

(function () {
  'use strict';

  const CART_KEY = 'quoteCart';
  const CART_SAVED_AT_KEY = 'quoteCartSavedAt';
  const CART_TTL_MS = 60 * 60 * 1000; // 1 hour
  const SPARE_PARTS_LOG = false;

  console.log('[Weldpoly] Quote System loaded — cart, modal, spare parts (unified)');
  let systemInitialized = false;

  function log(step, detail) {
    if (SPARE_PARTS_LOG && typeof console !== 'undefined' && console.log) {
      console.log('[Weldpoly Quote]', step, detail !== undefined ? detail : '');
    }
  }

  function initQuoteSystem() {
    if (systemInitialized) return;
    systemInitialized = true;

    const modalGroup = document.querySelector('[data-modal-group-status]');
    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    const quoteContent = quoteModal?.querySelector('.quote_modal-content');
    const templateItem = quoteModal?.querySelector('[data-quote-item]');
    const templatePartItem = quoteModal?.querySelector('[data-quote-part-item]');
    const titleEl = quoteModal?.querySelector('.quote_header-title');
    const emptyState = quoteModal?.querySelector('[quote-empty]') || quoteModal?.querySelector('.quote_empty-wrapper');
    const actionsBlock = quoteModal?.querySelector('.quote_modal-content-bottom');
    let cart = [];

    function saveCart() {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      try { localStorage.setItem(CART_SAVED_AT_KEY, String(Date.now())); } catch (_) {}
      try { document.dispatchEvent(new CustomEvent('quoteCartUpdated')); } catch (_) {}
    }

    const navQty = document.querySelector('[data-nav-quote-qty]');
    function updateNavQty() {
      if (!navQty) return;
      if (cart.length === 0) {
        navQty.style.display = 'none';
        navQty.textContent = '';
      } else {
        navQty.style.display = 'flex';
        navQty.textContent = cart.length;
      }
    }
    window.updateNavQty = updateNavQty;

    const modalSubmitBtn = document.querySelector('[data-quote-modal-submit]');
    if (modalSubmitBtn) {
      modalSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/get-a-quote';
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
      const raw = localStorage.getItem(CART_KEY);
      const savedAtRaw = localStorage.getItem(CART_SAVED_AT_KEY);
      const savedAt = savedAtRaw ? Number(savedAtRaw) : 0;
      if (savedAt && (Date.now() - savedAt > CART_TTL_MS)) {
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(CART_SAVED_AT_KEY);
        log('cart', 'expired (1h), cleared');
        try { document.dispatchEvent(new CustomEvent('quoteCartExpired')); } catch (_) {}
        cart = [];
        return;
      }
      if (raw) {
        try {
          cart = mergeDuplicateSpareParts(JSON.parse(raw));
        } catch {
          cart = [];
        }
      }
    }

    function updateTitle() {
      if (titleEl) titleEl.textContent = `QUOTE (${cart.length} ${cart.length === 1 ? 'ITEM' : 'ITEMS'})`;
    }

    function toggleEmptyState() {
      if (!emptyState || !actionsBlock) return;
      if (cart.length === 0) {
        emptyState.style.display = 'flex';
        actionsBlock.style.display = 'none';
      } else {
        emptyState.style.display = 'none';
        actionsBlock.style.display = 'block';
      }
    }

    function findInClone(root, selectors) {
      if (!root || !selectors || !selectors.length) return null;
      for (let i = 0; i < selectors.length; i++) {
        const el = root.querySelector(selectors[i]);
        if (el) return el;
      }
      return null;
    }

    function buildCartOrder() {
      const norm = t => (t || '').trim().toLowerCase();
      const order = [];
      cart.forEach((item, idx) => {
        if (!item.isSparePart) {
          order.push({ item, idx });
          cart.forEach((sp, j) => {
            if (sp.isSparePart && norm(sp.parentProductTitle) === norm(item.title)) order.push({ item: sp, idx: j });
          });
        }
      });
      cart.forEach((item, idx) => {
        if (item.isSparePart && !order.some(o => o.idx === idx)) order.push({ item, idx });
      });
      return order;
    }

    function renderCart() {
      if (!quoteContent || !templateItem) return;
      templateItem.style.display = 'none';
      if (templatePartItem) templatePartItem.style.display = 'none';
      quoteContent.querySelectorAll('.quote_item, .quote_part-item').forEach(el => {
        if (!el.hasAttribute('data-quote-item') && !el.hasAttribute('data-quote-part-item')) el.remove();
      });
      const templateProduct = templateItem;
      const templatePart = templatePartItem || templateItem;
      const order = buildCartOrder();
      const titleSelectors = ['[data-quote-title]', '.quote_part-item-title', '.quote_part-item_title', '.quote_item-title', '.quote_part-title', '.quote_item_content p:first-child', '.quote_item_content > *:first-child'];
      const descSelectors = ['[data-quote-description]', '.quote_part-item-description', '.quote_part-item_description', '.quote_item-description', '.quote_part-description', '.quote_item_content p:nth-of-type(2)', '.quote_item_content p:last-of-type', '.quote_item_content > *:nth-child(2)', '.quote_item_content > *:last-child'];

      const insertBeforeEl = emptyState || null;

      order.forEach(({ item, idx }) => {
        const isSparePart = item.isSparePart === true;
        const template = isSparePart ? templatePart : templateProduct;
        const clone = template.cloneNode(true);
        clone.style.display = 'flex';
        clone.removeAttribute('data-quote-item');
        clone.removeAttribute('data-quote-part-item');
        if (isSparePart) clone.classList.add('quote_part-item');

        const titleNode = findInClone(clone, titleSelectors) || clone.querySelector('[data-quote-title]');
        const descNode = findInClone(clone, descSelectors) || clone.querySelector('[data-quote-description]');
        const qtyEl = clone.querySelector('[data-quote-number]');
        if (titleNode) titleNode.textContent = item.title || '';
        if (descNode) descNode.textContent = item.description || '';
        if (qtyEl) {
          const q = item.qty || 1;
          qtyEl.textContent = q;
          const inner = qtyEl.querySelector('div');
          if (inner) inner.textContent = q;
        }
        if (isSparePart && !titleNode && !descNode) {
          const partContent = clone.querySelector('[data-quote-part-content]') || clone.querySelector('.quote_item_content');
          if (partContent) partContent.textContent = ((item.title || '') + ' ' + (item.description || '')).trim();
        }
        const imgEl = clone.querySelector('[data-quote-image]');
        if (imgEl) imgEl.remove();

        const plusBtn = clone.querySelector('.quote_plus');
        const minusBtn = clone.querySelector('.quote_minus');
        const removeBtn = clone.querySelector('[data-quote-remove]');
        if (plusBtn) plusBtn.addEventListener('click', () => { item.qty++; renderCart(); saveCart(); updateNavQty(); renderRequestQuotePageList(); });
        if (minusBtn) minusBtn.addEventListener('click', () => { if (item.qty > 1) item.qty--; renderCart(); saveCart(); updateNavQty(); renderRequestQuotePageList(); });
        if (removeBtn) removeBtn.addEventListener('click', (e) => { e.preventDefault(); cart.splice(idx, 1); renderCart(); saveCart(); updateNavQty(); renderRequestQuotePageList(); updateSparePartButtonsState(); });
        if (insertBeforeEl) quoteContent.insertBefore(clone, insertBeforeEl);
        else quoteContent.appendChild(clone);
      });
      updateTitle();
      toggleEmptyState();
    }

    const pageListContainer = document.querySelector('[data-quote-list]') || document.querySelector('.request-a-quote_list');
    const pageTitleEl = document.querySelector('[data-request-a-quote-title]');
    const pageTemplate = pageListContainer?.querySelector('[data-quote-placeholder]') || pageListContainer?.querySelector('[data-quote-item]') || pageListContainer?.querySelector('.quote_item') || templateItem || templatePartItem;

    function renderRequestQuotePageList() {
      if (!pageListContainer) return;
      const template = pageTemplate || templateItem || templatePartItem;
      if (!template) return;
      template.style.display = 'none';
      pageListContainer.querySelectorAll('.quote_item, .quote_part-item').forEach(el => {
        if (el !== template && !el.hasAttribute('data-quote-placeholder') && !el.hasAttribute('data-quote-item') && !el.hasAttribute('data-quote-part-item')) el.remove();
      });
      const order = buildCartOrder();
      order.forEach(({ item, idx }) => {
        const itemTemplate = (item.isSparePart && templatePartItem) ? templatePartItem : template;
        const clone = itemTemplate.cloneNode(true);
        clone.style.display = 'flex';
        clone.removeAttribute('data-quote-placeholder');
        clone.removeAttribute('data-quote-item');
        clone.removeAttribute('data-quote-part-item');
        if (item.isSparePart) clone.classList.add('quote_part-item');
        const tEl = clone.querySelector('[data-quote-title]') || clone.querySelector('.quote_item-title');
        const dEl = clone.querySelector('[data-quote-description]') || clone.querySelector('.quote_item-description');
        const qEl = clone.querySelector('[data-quote-number]') || clone.querySelector('.quote_number');
        if (tEl) tEl.textContent = item.title || '';
        if (dEl) dEl.textContent = item.description || '';
        if (qEl) { const q = item.qty || 1; qEl.textContent = q; const i = qEl.querySelector('div'); if (i) i.textContent = q; }
        const plusBtn = clone.querySelector('.quote_plus');
        const minusBtn = clone.querySelector('.quote_minus');
        const removeBtn = clone.querySelector('[data-quote-remove]');
        if (plusBtn) plusBtn.addEventListener('click', () => { item.qty++; saveCart(); renderCart(); renderRequestQuotePageList(); updateNavQty(); });
        if (minusBtn) minusBtn.addEventListener('click', () => { if (item.qty > 1) item.qty--; saveCart(); renderCart(); renderRequestQuotePageList(); updateNavQty(); });
        if (removeBtn) removeBtn.addEventListener('click', (e) => { e.preventDefault(); cart.splice(idx, 1); saveCart(); renderCart(); renderRequestQuotePageList(); updateNavQty(); updateSparePartButtonsState(); });
        pageListContainer.appendChild(clone);
      });
      if (pageTitleEl) pageTitleEl.textContent = `QUOTE (${cart.length} ${cart.length === 1 ? 'ITEM' : 'ITEMS'})`;
    }

    function setupModalScroll() {
      if (!quoteContent) return;
      quoteContent.style.overflowY = 'auto';
      quoteContent.style.overflowX = 'hidden';
      quoteContent.style.minHeight = '0';
      quoteContent.style.WebkitOverflowScrolling = 'touch';
      const modalCard = quoteModal?.querySelector('.modal__card') || quoteModal;
      if (modalCard) {
        const headerHeight = quoteModal?.querySelector('.quote_header')?.offsetHeight || 0;
        const actionsHeight = quoteModal?.querySelector('.quote_modal-content-bottom')?.offsetHeight || 0;
        quoteContent.style.maxHeight = (window.innerHeight - headerHeight - actionsHeight - 40) + 'px';
      }
      quoteContent.setAttribute('data-locomotive-scroll', 'ignore');
      quoteContent.setAttribute('data-scroll', 'ignore');
      quoteContent.classList.add('quote-modal-scrollable');
    }

    function handleModalScrollControl(modalOpen) {
      if (typeof window.disableLenisScroll !== 'function' || typeof window.enableLenisScroll !== 'function') {
        setTimeout(() => handleModalScrollControl(modalOpen), 100);
        return;
      }
      const body = document.body;
      const html = document.documentElement;
      if (modalOpen) {
        window.disableLenisScroll(body);
        window.disableLenisScroll(html);
        if (quoteContent) { quoteContent.removeAttribute('data-lenis-scroll'); quoteContent.style.overflowY = 'auto'; quoteContent.style.overflowX = 'hidden'; }
      } else {
        window.enableLenisScroll(body);
        window.enableLenisScroll(html);
      }
    }

    function openQuoteModal() {
      loadCart();
      if (modalGroup) modalGroup.setAttribute('data-modal-group-status', 'active');
      if (quoteModal) quoteModal.setAttribute('data-modal-status', 'active');
      setupModalScroll();
      handleModalScrollControl(true);
      renderCart();
    }

    function closeQuoteModal() {
      if (modalGroup) modalGroup.setAttribute('data-modal-group-status', 'not-active');
      if (quoteModal) quoteModal.setAttribute('data-modal-status', 'not-active');
      handleModalScrollControl(false);
    }
    window.openQuoteModal = openQuoteModal;
    window.closeQuoteModal = closeQuoteModal;

    function addProductToCart(button) {
      loadCart();
      const title = button.getAttribute('data-quote-title') || 'Unnamed item';
      const description = button.getAttribute('data-quote-description') || '';
      const existing = cart.find(i => i.title === title);
      if (existing) existing.qty++;
      else cart.push({ title, description, qty: 1 });
      renderCart();
      saveCart();
      updateNavQty();
      updateSparePartButtonsState();
    }

    document.addEventListener('click', function (e) {
      const openBtn = e.target.closest('[data-modal-target="quote-modal"]');
      if (openBtn) {
        e.preventDefault();
        if (openBtn.hasAttribute('data-add-quote')) addProductToCart(openBtn);
        openQuoteModal();
      }
    });

    document.addEventListener('click', function (e) {
      const closeBtn = e.target.closest('.modal__btn-close, [data-modal-close]');
      if (closeBtn) { e.preventDefault(); closeQuoteModal(); }
    });

    document.querySelectorAll('[data-add-quote]').forEach(btn => {
      if (btn.hasAttribute('data-modal-target')) return;
      btn.addEventListener('click', (e) => { e.preventDefault(); addProductToCart(btn); openQuoteModal(); });
    });

    if (quoteModal) {
      const modalObserver = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          if (m.type === 'attributes' && m.attributeName === 'data-modal-status') {
            const isActive = quoteModal.getAttribute('data-modal-status') === 'active';
            setTimeout(() => {
              if (isActive) { setupModalScroll(); handleModalScrollControl(true); renderCart(); }
              else { handleModalScrollControl(false); updateSparePartButtonsState(); }
            }, 50);
          }
        });
      });
      modalObserver.observe(quoteModal, { attributes: true, attributeFilter: ['data-modal-status'] });
    }

    document.addEventListener('quoteCartExpired', () => { loadCart(); renderCart(); renderRequestQuotePageList(); updateNavQty(); updateSparePartButtonsState(); });
    document.addEventListener('quoteCartUpdated', () => { loadCart(); renderCart(); renderRequestQuotePageList(); updateNavQty(); updateSparePartButtonsState(); });

    function getSparePartTitle(container) {
      const el = container.querySelector('.spare-part-name') || container.querySelector('[spare-part-content]');
      if (el) { const t = (el.textContent || '').trim(); if (t && t.length > 1) return t; }
      const two = (container.textContent || '').trim().split(/\s+/).slice(0, 2).join(' ').trim();
      return (two && two.length > 1) ? two : 'Spare part';
    }

    function getSparePartDescription(container) {
      for (const sel of ['.card_description', '[data-quote-description]', '.spare-part-description']) {
        const el = container.querySelector(sel);
        if (el) { const t = (el.textContent || '').trim(); if (t && t.length > 1) return t; }
      }
      return '';
    }

    function getParentProductTitle() {
      const byAttr = document.querySelector('[data-quote-product-title]');
      if (byAttr) { const t = (byAttr.getAttribute('data-quote-product-title') || byAttr.textContent || '').trim(); if (t) return t; }
      const btn = document.querySelector('[data-add-quote][data-quote-title]');
      if (btn) { const t = (btn.getAttribute('data-quote-title') || '').trim(); if (t) return t; }
      return '';
    }

    const norm = s => (s || '').trim().toLowerCase();
    function isSparePartInCart(container) {
      const title = getSparePartTitle(container);
      const parentTitle = getParentProductTitle();
      const idx = cart.findIndex(i => i.isSparePart && norm(i.title) === norm(title) && norm(i.parentProductTitle) === norm(parentTitle));
      return { inCart: idx >= 0, index: idx >= 0 ? idx : -1 };
    }

    function updateSparePartButtonsState() {
      document.querySelectorAll('[spare-part-item], .spare-part-item, .collection_spare-part-item').forEach(container => {
        const trigger = container.querySelector('[spare-part-add]') || container.querySelector('.spare-part-qty-plus') || container.querySelector('input[type="checkbox"]');
        if (!trigger) return;
        const { inCart } = isSparePartInCart(container);
        if (trigger.type === 'checkbox') {
          trigger.checked = inCart;
          trigger.setAttribute('aria-checked', inCart ? 'true' : 'false');
        } else {
          trigger.setAttribute('data-in-quote', inCart ? 'true' : 'false');
          trigger.classList.toggle('spare-part-in-quote', inCart);
          const t = (trigger.textContent || '').trim();
          if (t === '+' || t === '') trigger.textContent = inCart ? '\u2713' : '+';
        }
      });
    }

    function toggleSparePartInQuote(trigger) {
      const container = trigger.closest('[spare-part-item]') || trigger.closest('.spare-part-item') || trigger.closest('.collection_spare-part-item');
      if (!container) return;
      const title = getSparePartTitle(container);
      const description = getSparePartDescription(container);
      const parentTitle = getParentProductTitle();
      const same = cart.findIndex(i => i.isSparePart && norm(i.title) === norm(title) && norm(i.parentProductTitle) === norm(parentTitle));
      if (same >= 0) {
        cart.splice(same, 1);
        saveCart();
        updateSparePartButtonsState();
        renderCart();
        updateNavQty();
      } else {
        cart.push({ title, description, qty: 1, isSparePart: true, parentProductTitle: parentTitle || '' });
        saveCart();
        updateSparePartButtonsState();
        renderCart();
        updateNavQty();
        openQuoteModal();
      }
    }

    document.addEventListener('click', function (e) {
      let trigger = e.target.closest('[spare-part-add]') || e.target.closest('.spare-part-qty-plus');
      if (!trigger && e.target.type === 'checkbox') {
        const wrap = e.target.closest('[spare-part-item], .spare-part-item, .collection_spare-part-item');
        if (wrap) trigger = e.target;
      }
      if (!trigger) return;
      e.preventDefault();
      e.stopPropagation();
      toggleSparePartInQuote(trigger);
    });

    loadCart();
    renderCart();
    renderRequestQuotePageList();
    updateNavQty();
    updateSparePartButtonsState();

    if (quoteModal && quoteModal.getAttribute('data-modal-status') === 'active') {
      setupModalScroll();
      handleModalScrollControl(true);
    }
  }

  window.initQuoteSystem = initQuoteSystem;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initQuoteSystem);
  else initQuoteSystem();
  if (typeof Webflow !== 'undefined') Webflow.push(() => { if (!systemInitialized) initQuoteSystem(); });
})();
