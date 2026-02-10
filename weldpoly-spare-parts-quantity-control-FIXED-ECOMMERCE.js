/**
 * Weldpoly Spare Parts — Add spare parts to quote modal
 * Load AFTER weldpoly-quote-system.js
 *
 * On click of [spare-part-add] (e.g. the + in .spare-part-quantity-control):
 * - Reads title/description from the parent [spare-part-item]
 * - Adds item to quoteCart (localStorage) with isSparePart + parentProductTitle
 * - Re-renders the modal using [data-quote-item] for products and [data-quote-part-item] for spare parts
 * - Spare parts appear below their parent product
 * - Opens the modal
 */

(function () {
  'use strict';

  console.log('[Weldpoly] Spare Parts loaded — add spare parts to quote, shown below product in modal');

  const CART_KEY = 'quoteCart';

  function getCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const cart = raw ? JSON.parse(raw) : [];
      return Array.isArray(cart) ? cart : [];
    } catch {
      return [];
    }
  }

  function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function getSparePartTitle(container) {
    const el = container.querySelector('.spare-part-name') || container.querySelector('[spare-part-content]');
    if (el) {
      const t = (el.textContent || '').trim();
      if (t && t.length > 1) return t;
    }
    const two = (container.textContent || '').trim().split(/\s+/).slice(0, 2).join(' ').trim();
    if (two && two.length > 1) return two;
    return 'Spare part';
  }

  function getSparePartDescription(container) {
    const sel = ['.card_description', '[data-quote-description]', '.spare-part-description'];
    for (const s of sel) {
      const el = container.querySelector(s);
      if (el) {
        const t = (el.textContent || '').trim();
        if (t && t.length > 1) return t;
      }
    }
    return '';
  }

  function getParentProductTitle() {
    const byAttr = document.querySelector('[data-quote-product-title]');
    if (byAttr) {
      const t = (byAttr.getAttribute('data-quote-product-title') || byAttr.textContent || '').trim();
      if (t) return t;
    }
    const btn = document.querySelector('[data-add-quote][data-quote-title]');
    if (btn) {
      const t = (btn.getAttribute('data-quote-title') || '').trim();
      if (t) return t;
    }
    return '';
  }

  function openQuoteModal() {
    const group = document.querySelector('[data-modal-group-status]');
    const modal = document.querySelector('[data-modal-name="quote-modal"]');
    if (group) group.setAttribute('data-modal-group-status', 'active');
    if (modal) modal.setAttribute('data-modal-status', 'active');
  }

  function renderModalFromCart() {
    const modal = document.querySelector('[data-modal-name="quote-modal"]');
    const content = modal && modal.querySelector('.quote_modal-content');
    const productTpl = modal && modal.querySelector('[data-quote-item]');
    const partTpl = modal && modal.querySelector('[data-quote-part-item]');
    if (!content || !productTpl) return;

    const cart = getCart();
    const emptyEl = content.querySelector('[quote-empty]');
    const actionsEl = modal && modal.querySelector('.quote_modal-content-bottom');
    const titleEl = modal && modal.querySelector('.quote_header-title');

    if (titleEl) titleEl.textContent = cart.length === 0 ? 'QUOTE (0 ITEMS)' : `QUOTE (${cart.length} ${cart.length === 1 ? 'ITEM' : 'ITEMS'})`;
    if (emptyEl) emptyEl.style.display = cart.length === 0 ? 'flex' : 'none';
    if (actionsEl) actionsEl.style.display = cart.length === 0 ? 'none' : 'block';

    productTpl.style.display = 'none';
    if (partTpl) partTpl.style.display = 'none';

    content.querySelectorAll('.quote_item, .quote_part-item').forEach(function (el) {
      if (!el.hasAttribute('data-quote-item') && !el.hasAttribute('data-quote-part-item')) el.remove();
    });

    const norm = function (t) { return (t || '').trim().toLowerCase(); };

    const order = [];
    cart.forEach(function (item, idx) {
      if (!item.isSparePart) {
        order.push({ item: item, idx: idx });
        const parentTitle = norm(item.title);
        cart.forEach(function (sp, j) {
          if (sp.isSparePart && norm(sp.parentProductTitle) === parentTitle) order.push({ item: sp, idx: j });
        });
      }
    });
    cart.forEach(function (item, idx) {
      if (item.isSparePart && !order.some(function (o) { return o.idx === idx; })) order.push({ item: item, idx: idx });
    });

    const partTemplate = partTpl || productTpl;

    order.forEach(function (entry) {
      const item = entry.item;
      const idx = entry.idx;
      const isPart = item.isSparePart === true;
      const tpl = isPart ? partTemplate : productTpl;
      const clone = tpl.cloneNode(true);

      clone.style.display = 'flex';
      clone.removeAttribute('data-quote-item');
      clone.removeAttribute('data-quote-part-item');

      const titleNode = clone.querySelector('[data-quote-title]');
      const descNode = clone.querySelector('[data-quote-description]');
      const qtyNode = clone.querySelector('[data-quote-number]');
      if (titleNode) titleNode.textContent = item.title || '';
      if (descNode) descNode.textContent = item.description || '';
      if (qtyNode) {
        const q = item.qty || 1;
        qtyNode.textContent = q;
        const inner = qtyNode.querySelector('div');
        if (inner) inner.textContent = q;
      }

      const plusBtn = clone.querySelector('.quote_plus');
      const minusBtn = clone.querySelector('.quote_minus');
      const removeBtn = clone.querySelector('[data-quote-remove]');

      if (plusBtn) {
        plusBtn.addEventListener('click', function () {
          item.qty = (item.qty || 1) + 1;
          setCart(cart);
          renderModalFromCart();
          if (typeof window.updateNavQty === 'function') window.updateNavQty();
        });
      }
      if (minusBtn) {
        minusBtn.addEventListener('click', function () {
          if ((item.qty || 1) > 1) item.qty--;
          setCart(cart);
          renderModalFromCart();
          if (typeof window.updateNavQty === 'function') window.updateNavQty();
        });
      }
      if (removeBtn) {
        removeBtn.addEventListener('click', function (e) {
          e.preventDefault();
          cart.splice(idx, 1);
          setCart(cart);
          renderModalFromCart();
          if (typeof window.updateNavQty === 'function') window.updateNavQty();
        });
      }

      content.appendChild(clone);
    });
  }

  function addSparePartToQuote(button) {
    const container = button.closest('[spare-part-item]');
    if (!container) return;

    const title = getSparePartTitle(container);
    const description = getSparePartDescription(container);
    const parentTitle = getParentProductTitle();

    const cart = getCart();
    const same = cart.findIndex(function (i) {
      return i.isSparePart && (i.title || '').trim().toLowerCase() === title.trim().toLowerCase() && (i.parentProductTitle || '') === (parentTitle || '');
    });

    if (same >= 0) {
      cart[same].qty = (cart[same].qty || 1) + 1;
    } else {
      cart.push({
        title: title,
        description: description,
        qty: 1,
        isSparePart: true,
        parentProductTitle: parentTitle || ''
      });
    }

    setCart(cart);
    renderModalFromCart();
    if (typeof window.updateNavQty === 'function') window.updateNavQty();
    openQuoteModal();
  }

  function init() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[spare-part-add]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      addSparePartToQuote(btn);
    });

    const modal = document.querySelector('[data-modal-name="quote-modal"]');
    if (modal) {
      const obs = new MutationObserver(function () {
        if (modal.getAttribute('data-modal-status') === 'active') renderModalFromCart();
      });
      obs.observe(modal, { attributes: true, attributeFilter: ['data-modal-status'] });
    }

    document.addEventListener('quoteCartUpdated', function () { renderModalFromCart(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }
})();
