/**
 * Weldpoly Spare Parts — Add spare parts to quote modal
 * Load AFTER weldpoly-quote-system.js
 *
 * Toggle behaviour (checkbox-like):
 * - Click add: spare part in quote → show checkmark / checked.
 * - Click again: remove from quote → show + / unchecked.
 *
 * Triggers: [spare-part-add], .spare-part-qty-plus, or a checkbox inside [spare-part-item] / .spare-part-item.
 * When in quote: button gets class "spare-part-in-quote" and data-in-quote="true" (or checkbox.checked = true).
 * Style checkmark in Webflow with .spare-part-in-quote (e.g. ::before { content: '\2713'; } or swap icon).
 *
 * Cart expiry: 1 hour.
 */

(function () {
  'use strict';

  const CART_KEY = 'quoteCart';
  const CART_SAVED_AT_KEY = 'quoteCartSavedAt';
  const CART_TTL_MS = 60 * 60 * 1000; // 1 hour
  const LOG = true;
  function log(step, detail) {
    if (LOG && typeof console !== 'undefined' && console.log) {
      console.log('[Weldpoly Spare Parts]', step, detail !== undefined ? detail : '');
    }
  }

  log('script loaded', 'add spare parts to quote, cart expires after 1h');

  function getCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const savedAtRaw = localStorage.getItem(CART_SAVED_AT_KEY);
      const savedAt = savedAtRaw ? Number(savedAtRaw) : 0;

      if (savedAt && (Date.now() - savedAt > CART_TTL_MS)) {
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(CART_SAVED_AT_KEY);
        log('cart', 'expired (older than 1h), cleared');
        try { document.dispatchEvent(new CustomEvent('quoteCartExpired')); } catch (_) {}
        return [];
      }

      if (raw) {
        if (!savedAt) localStorage.setItem(CART_SAVED_AT_KEY, String(Date.now()));
        const cart = JSON.parse(raw);
        return Array.isArray(cart) ? cart : [];
      }
      return [];
    } catch {
      return [];
    }
  }

  function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    localStorage.setItem(CART_SAVED_AT_KEY, String(Date.now()));
  }

  /** Merge duplicate spare parts (same title + parent) into one entry with summed qty. */
  function mergeDuplicateSpareParts(cart) {
    var norm = function (s) { return (s || '').trim().toLowerCase(); };
    var seen = [];
    var result = [];
    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      if (!item.isSparePart) {
        result.push(item);
        continue;
      }
      var key = norm(item.title) + '\n' + norm(item.parentProductTitle);
      var idx = seen.indexOf(key);
      if (idx >= 0) {
        result[idx].qty = (result[idx].qty || 1) + (item.qty || 1);
      } else {
        seen.push(key);
        result.push({ title: item.title, description: item.description, qty: item.qty || 1, isSparePart: true, parentProductTitle: item.parentProductTitle || '' });
      }
    }
    return result;
  }

  /** Find first element matching any of the selectors (for template variants in Webflow). */
  function findInClone(root, selectors) {
    if (!root || !selectors || !selectors.length) return null;
    for (var i = 0; i < selectors.length; i++) {
      var el = root.querySelector(selectors[i]);
      if (el) return el;
    }
    return null;
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
    log('render', 'renderModalFromCart() called');
    const modal = document.querySelector('[data-modal-name="quote-modal"]');
    const content = modal && modal.querySelector('.quote_modal-content');
    const productTpl = modal && modal.querySelector('[data-quote-item]');
    const partTpl = modal && modal.querySelector('[data-quote-part-item]');
    if (!content || !productTpl) {
      log('render', { skip: true, reason: 'modal or .quote_modal-content or [data-quote-item] not found', hasModal: !!modal, hasContent: !!content, hasProductTpl: !!productTpl, hasPartTpl: !!partTpl });
      return;
    }

    var rawCart = getCart();
    var cart = mergeDuplicateSpareParts(rawCart);
    if (cart.length !== rawCart.length) setCart(cart);
    log('render', 'cart from localStorage', { count: cart.length, spareParts: cart.filter(function (i) { return i.isSparePart; }).length });
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
      if (isPart) clone.classList.add('quote_part-item');

      var titleSelectors = ['[data-quote-title]', '.quote_part-item-title', '.quote_part-item_title', '.quote_item-title', '.quote_part-title', '.quote_item_content p:first-child', '.quote_item_content > *:first-child', '.quote_part-item [data-quote-title]', '.quote_part-item .quote_item-title', '.quote_part-item p:first-of-type', '.quote_part-item .quote_item_content p:first-of-type'];
      var descSelectors = ['[data-quote-description]', '.quote_part-item-description', '.quote_part-item_description', '.quote_item-description', '.quote_part-description', '.quote_item_content p:nth-of-type(2)', '.quote_item_content p:last-of-type', '.quote_item_content > *:nth-child(2)', '.quote_item_content > *:last-child', '.quote_part-item [data-quote-description]', '.quote_part-item .quote_item-description', '.quote_part-item p:nth-of-type(2)', '.quote_part-item .quote_item_content p:nth-of-type(2)'];
      var titleNode = findInClone(clone, titleSelectors);
      var descNode = findInClone(clone, descSelectors);
      if (titleNode) titleNode.textContent = item.title || '';
      if (descNode) descNode.textContent = item.description || '';
      if (isPart && !titleNode && !descNode) {
        var partContent = clone.querySelector('[data-quote-part-content]') || clone.querySelector('.quote_item_content');
        if (partContent) {
          var fullText = (item.title || '') + (item.description ? ' ' + item.description : '');
          if (fullText.trim()) partContent.textContent = fullText.trim();
          log('render', 'spare part filled via content block fallback (no title/desc nodes found)');
        }
      }
      var qtyNode = clone.querySelector('[data-quote-number]');
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
    log('render', 'done', { orderLength: order.length });
  }

  var norm = function (s) { return (s || '').trim().toLowerCase(); };

  /** Returns { inCart: boolean, index: number } for the spare part in this container. */
  function isSparePartInCart(container) {
    var title = getSparePartTitle(container);
    var parentTitle = getParentProductTitle();
    var titleNorm = norm(title);
    var parentNorm = norm(parentTitle);
    var cart = getCart();
    var idx = cart.findIndex(function (i) {
      if (!i.isSparePart) return false;
      return norm(i.title) === titleNorm && norm(i.parentProductTitle) === parentNorm;
    });
    return { inCart: idx >= 0, index: idx >= 0 ? idx : -1 };
  }

  /** Update all spare-part add buttons / checkboxes on the page to reflect cart state (checkmark vs +). */
  function updateSparePartButtonsState() {
    var containers = document.querySelectorAll('[spare-part-item], .spare-part-item, .collection_spare-part-item');
    containers.forEach(function (container) {
      var trigger = container.querySelector('[spare-part-add]') || container.querySelector('.spare-part-qty-plus') || container.querySelector('input[type="checkbox"]');
      if (!trigger) return;
      var state = isSparePartInCart(container);
      var inQuote = state.inCart;
      if (trigger.type === 'checkbox') {
        trigger.checked = inQuote;
        trigger.setAttribute('aria-checked', inQuote ? 'true' : 'false');
      } else {
        trigger.setAttribute('data-in-quote', inQuote ? 'true' : 'false');
        trigger.classList.toggle('spare-part-in-quote', inQuote);
        var t = (trigger.textContent || '').trim();
        if (t === '+' || t === '') trigger.textContent = inQuote ? '\u2713' : '+';
      }
    });
  }

  /** Toggle spare part in quote: add if not in cart, remove if already in cart. Opens modal only when adding. */
  function toggleSparePartInQuote(trigger) {
    log('click', 'spare-part toggle (add/remove)');
    var container = trigger.closest('[spare-part-item]') || trigger.closest('.spare-part-item') || trigger.closest('.collection_spare-part-item');
    if (!container) {
      log('error', 'container not found');
      return;
    }

    var title = getSparePartTitle(container);
    var description = getSparePartDescription(container);
    var parentTitle = getParentProductTitle();
    var titleNorm = norm(title);
    var parentNorm = norm(parentTitle);
    var cart = getCart();
    var same = cart.findIndex(function (i) {
      if (!i.isSparePart) return false;
      return norm(i.title) === titleNorm && norm(i.parentProductTitle) === parentNorm;
    });

    var wasInCart = same >= 0;
    if (wasInCart) {
      cart.splice(same, 1);
      setCart(cart);
      log('cart', 'removed spare part from quote');
      updateSparePartButtonsState();
      renderModalFromCart();
      if (typeof window.updateNavQty === 'function') window.updateNavQty();
    } else {
      cart.push({
        title: title,
        description: description,
        qty: 1,
        isSparePart: true,
        parentProductTitle: parentTitle || ''
      });
      setCart(cart);
      log('cart', 'added spare part to quote');
      updateSparePartButtonsState();
      renderModalFromCart();
      if (typeof window.updateNavQty === 'function') window.updateNavQty();
      openQuoteModal();
      log('modal', 'openQuoteModal() called');
    }
  }

  function init() {
    log('init', 'attaching click listener for [spare-part-add], .spare-part-qty-plus, or checkbox');
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[spare-part-add]') || e.target.closest('.spare-part-qty-plus');
      if (!trigger && e.target.type === 'checkbox') {
        var wrap = e.target.closest('[spare-part-item], .spare-part-item, .collection_spare-part-item');
        if (wrap) trigger = e.target;
      }
      if (!trigger) return;
      e.preventDefault();
      e.stopPropagation();
      toggleSparePartInQuote(trigger);
    });

    var modal = document.querySelector('[data-modal-name="quote-modal"]');
    if (modal) {
      var obs = new MutationObserver(function () {
        if (modal.getAttribute('data-modal-status') === 'active') {
          renderModalFromCart();
        } else {
          updateSparePartButtonsState();
        }
      });
      obs.observe(modal, { attributes: true, attributeFilter: ['data-modal-status'] });
    }

    document.addEventListener('quoteCartUpdated', function () {
      renderModalFromCart();
      updateSparePartButtonsState();
    });

    updateSparePartButtonsState();
    log('init', 'ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }
})();
