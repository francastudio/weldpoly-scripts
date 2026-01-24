/**
 * Spare Parts Quantity Control System - E-commerce Style
 * 
 * This version integrates with the existing initQuoteSystem and ensures items
 * are displayed in the modal immediately when added, like an e-commerce cart.
 * 
 * FEATURES:
 * - Integrates with existing initQuoteSystem (uses renderCart, not renderQuoteCart)
 * - Items appear in modal immediately when quantity > 0
 * - Automatic modal opening when item is first added
 * - Bidirectional sync (spare parts ↔ modal)
 * - Works with existing quote system without breaking it
 * 
 * INSTRUCTIONS:
 * 1. In Webflow Designer, create the layout with:
 *    - Button with class: spare-part-qty-minus
 *    - Input with class: spare-part-qty-input (type="number", value="0", min="0")
 *    - Button with class: spare-part-qty-plus
 *    - Spare part name with attribute spare-part-item={{name}}
 *    - Spare part content wrapper with attribute spare-part-content (contains the HTML to be used in modal)
 * 
 * 2. In the quote modal, ensure you have:
 *    - Template for products: [data-quote-item] (existing)
 *    - Template for spare parts: [data-quote-part-item] (optional, if not provided, uses product template)
 * 
 * 3. Add this script to Webflow footer (AFTER the initQuoteSystem script)
 */

(function() {
  'use strict';

  const processed = new WeakSet();
  const sparePartInputs = new Map();

  function isValidSparePartName(value) {
    if (!value || typeof value !== 'string') return false;
    const trimmed = value.trim();
    return trimmed.length > 2 && 
           !trimmed.includes('{{') && 
           !trimmed.includes('}}') &&
           trimmed.toLowerCase() !== 'name';
  }

  function getSparePartTitle(container) {
    const sparePartItem = container.hasAttribute('spare-part-item') ? container : 
                          container.closest('[spare-part-item]');
    
    if (sparePartItem) {
      const attrValue = sparePartItem.getAttribute('spare-part-item');
      if (isValidSparePartName(attrValue)) {
        return attrValue.trim();
      }
    }
    
    return 'Unnamed spare part';
  }

  function getSparePartContentHTML(container) {
    // Try multiple selectors to find the spare part content element
    const sparePartContent = container.querySelector('[spare-part-content]') || 
                            container.querySelector('.spare-part-content-wrap') ||
                            container.closest('[spare-part-item]')?.querySelector('[spare-part-content]') ||
                            container.closest('[spare-part-item]')?.querySelector('.spare-part-content-wrap');
    
    if (sparePartContent) {
      // Use outerHTML to capture the element with its attributes and content
      const html = sparePartContent.outerHTML || sparePartContent.innerHTML;
      console.log('[Quote Cart] ✅ Spare part content captured:', html.substring(0, 100) + '...');
      return html;
    }
    
    console.log('[Quote Cart] ⚠️ Spare part content not found in container');
    return '';
  }

  function saveCartToStorage(cart) {
    const cartString = JSON.stringify(cart);
    localStorage.setItem('quoteCart', cartString);
  }

  function syncSparePartsWithCart() {
    try {
      const saved = localStorage.getItem('quoteCart');
      if (!saved) {
        sparePartInputs.forEach((input) => {
          if (input && input.value !== '0') {
            const container = input.closest('[spare-part-item]');
            if (container && container._sparePartControl) {
              container._sparePartControl.isProgrammaticChange = true;
            }
            input.value = '0';
            if (container && container._sparePartControl) {
              setTimeout(() => {
                container._sparePartControl.isProgrammaticChange = false;
              }, 100);
            }
          }
        });
        return;
      }
      
      const cart = JSON.parse(saved);
      if (!Array.isArray(cart)) return;
      
      sparePartInputs.forEach((input, title) => {
        if (!input) return;
        
        const cartItem = cart.find(item => {
          if (!item || !item.title) return false;
          return item.title.trim().toLowerCase() === title.trim().toLowerCase();
        });
        
        const newQty = cartItem ? cartItem.qty : 0;
        const currentQty = parseInt(input.value, 10) || 0;
        
        if (currentQty !== newQty) {
          const container = input.closest('[spare-part-item]');
          if (container && container._sparePartControl) {
            container._sparePartControl.isProgrammaticChange = true;
          }
          input.value = newQty.toString();
          if (container && container._sparePartControl) {
            setTimeout(() => {
              container._sparePartControl.isProgrammaticChange = false;
            }, 100);
          }
        }
      });
    } catch (err) {
      // Ignore errors
    }
  }

  function handleCartUpdate() {
    setTimeout(() => {
      syncSparePartsWithCart();
      // Call original updateNavQty if available
      if (typeof window.initQuoteSystem === 'function') {
        // The original initQuoteSystem has updateNavQty inside, we'll trigger it via renderCart
        triggerOriginalRenderCart();
      }
    }, 100);
  }
  document.addEventListener('quoteCartUpdated', handleCartUpdate);
  document.addEventListener('reloadQuoteCart', handleCartUpdate);

  window.addEventListener('storage', function(e) {
    if (e.key === 'quoteCart') {
      handleCartUpdate();
    }
  });

  // Function to manually render cart items when renderCart fails
  function manualRenderCart() {
    console.log('[Quote Cart] 🔄 manualRenderCart() called');
    
    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    if (!quoteModal) {
      console.log('[Quote Cart] ⚠️ Quote modal not found');
      return;
    }

    const quoteContent = quoteModal.querySelector('.quote_modal-content');
    if (!quoteContent) {
      console.log('[Quote Cart] ⚠️ Quote content not found');
      return;
    }

    // Get templates
    const templateItem = quoteModal.querySelector('[data-quote-item]');
    const templatePartItem = quoteModal.querySelector('[data-quote-part-item]');
    
    if (!templateItem && !templatePartItem) {
      console.log('[Quote Cart] ⚠️ No template found (neither data-quote-item nor data-quote-part-item)');
      return;
    }

    // Get cart from localStorage
    let cart = [];
    try {
      const saved = localStorage.getItem('quoteCart');
      console.log('[Quote Cart] 📦 Reading cart from localStorage:', saved ? `Found ${saved.length} chars` : 'Empty');
      if (saved) {
        cart = JSON.parse(saved);
        if (!Array.isArray(cart)) cart = [];
        console.log(`[Quote Cart] 📦 Cart parsed: ${cart.length} items`, cart);
      }
    } catch (err) {
      console.log('[Quote Cart] ⚠️ Error reading cart:', err);
      cart = [];
    }

    if (cart.length === 0) {
      console.log('[Quote Cart] ℹ️ Cart is empty - showing empty state');
      // Update empty state
      const emptyWrapper = quoteContent.querySelector('[quote-empty]');
      const actionsBlock = quoteModal.querySelector('.quote_modal-content-bottom');
      if (emptyWrapper) emptyWrapper.style.display = 'flex';
      if (actionsBlock) actionsBlock.style.display = 'none';
      
      // Update title
      const titleEl = quoteModal.querySelector('.quote_header-title');
      if (titleEl) titleEl.textContent = 'QUOTE (0 ITEMS)';
      
      return;
    }
    
    console.log(`[Quote Cart] ✅ Cart has ${cart.length} items, rendering...`);

    // Hide empty state and show actions block
    const emptyWrapper = quoteContent.querySelector('[quote-empty]');
    const actionsBlock = quoteModal.querySelector('.quote_modal-content-bottom');
    if (emptyWrapper) {
      emptyWrapper.style.display = 'none';
      console.log('[Quote Cart] ✅ Empty state hidden');
    } else {
      console.log('[Quote Cart] ⚠️ Empty state element not found');
    }
    if (actionsBlock) {
      actionsBlock.style.display = 'block';
      console.log('[Quote Cart] ✅ Actions block shown');
    } else {
      console.log('[Quote Cart] ⚠️ Actions block not found');
    }

    // Hide the template item if it exists and is visible
    const templateItem = quoteModal.querySelector('[data-quote-item]');
    const templatePartItem = quoteModal.querySelector('[data-quote-part-item]');
    if (templateItem) {
      templateItem.style.display = 'none';
      console.log('[Quote Cart] ✅ Template item hidden');
    }
    if (templatePartItem) {
      templatePartItem.style.display = 'none';
      console.log('[Quote Cart] ✅ Template part item hidden');
    }

    // Remove existing rendered items (but keep templates)
    const existingItems = quoteContent.querySelectorAll('.quote_item:not([style*="display: none"]):not([data-quote-item]):not([data-quote-part-item])');
    const removedCount = existingItems.length;
    existingItems.forEach(el => el.remove());
    if (removedCount > 0) {
      console.log(`[Quote Cart] ✅ Removed ${removedCount} existing items`);
    }

    // Render each item
    cart.forEach((item, index) => {
      // Choose template based on item type
      const isSparePart = item.isSparePart === true;
      const useTemplate = isSparePart && templatePartItem ? templatePartItem : templateItem;
      
      if (!useTemplate) {
        console.log('[Quote Cart] ⚠️ No template available for item:', item.title);
        return;
      }

      const clone = useTemplate.cloneNode(true);
      clone.style.display = 'flex';
      clone.classList.add('quote_item');
      // Remove template attributes to avoid confusion
      clone.removeAttribute('data-quote-item');
      clone.removeAttribute('data-quote-part-item');

      // If it's a spare part with custom HTML, use that
      if (isSparePart && item.sparePartContentHTML) {
        console.log(`[Quote Cart] 🔧 Rendering spare part with custom HTML: ${item.title}`);
        console.log(`[Quote Cart] 📦 HTML content length: ${item.sparePartContentHTML.length} chars`);
        
        // Find the content container - try multiple selectors
        const contentContainer = clone.querySelector('[data-quote-part-content]') || 
                                clone.querySelector('.quote_item_content') ||
                                clone.querySelector('.quote_item-content') ||
                                clone;
        
        if (contentContainer) {
          console.log('[Quote Cart] ✅ Content container found, inserting HTML');
          // Clear existing content
          contentContainer.innerHTML = '';
          // Insert the spare part content HTML
          contentContainer.insertAdjacentHTML('beforeend', item.sparePartContentHTML);
          console.log('[Quote Cart] ✅ HTML inserted into content container');
          
          // Re-query elements after HTML insertion to update title, description, quantity
          const newTitleEl = clone.querySelector('[data-quote-title]');
          const newDescEl = clone.querySelector('[data-quote-description]');
          const newQtyEl = clone.querySelector('[data-quote-number]');
          
          if (newTitleEl) {
            newTitleEl.textContent = item.title || '';
            console.log(`[Quote Cart] ✅ Title set: ${item.title}`);
          } else {
            console.log('[Quote Cart] ⚠️ Title element not found after HTML insertion');
          }
          
          if (newDescEl) {
            newDescEl.textContent = item.description || '';
          }
          
          if (newQtyEl) {
            newQtyEl.textContent = item.qty || 1;
            const nestedDiv = newQtyEl.querySelector('div');
            if (nestedDiv) nestedDiv.textContent = item.qty || 1;
            console.log(`[Quote Cart] ✅ Quantity set: ${item.qty}`);
          } else {
            console.log('[Quote Cart] ⚠️ Quantity element not found after HTML insertion');
          }
        } else {
          console.log('[Quote Cart] ⚠️ Content container not found for spare part HTML');
        }
      } else {
        // Regular product item
        // Safely set title
        const titleEl = clone.querySelector('[data-quote-title]');
        if (titleEl) {
          titleEl.textContent = item.title || '';
        }

        // Safely set description
        const descEl = clone.querySelector('[data-quote-description]');
        if (descEl) {
          descEl.textContent = item.description || '';
        }

        // Safely set quantity
        const qtyEl = clone.querySelector('[data-quote-number]');
        if (qtyEl) {
          qtyEl.textContent = item.qty || 1;
          const nestedDiv = qtyEl.querySelector('div');
          if (nestedDiv) nestedDiv.textContent = item.qty || 1;
        }

        // Remove image if exists
        const imgEl = clone.querySelector('[data-quote-image]');
        if (imgEl) imgEl.remove();
      }

      // Add event listeners for controls
      const plusBtn = clone.querySelector('.quote_plus');
      const minusBtn = clone.querySelector('.quote_minus');
      const removeBtn = clone.querySelector('[data-quote-remove]');

      if (plusBtn) {
        plusBtn.addEventListener('click', () => {
          item.qty++;
          saveCartToStorage(cart);
          manualRenderCart();
          triggerOriginalRenderCart();
        });
      }

      if (minusBtn) {
        minusBtn.addEventListener('click', () => {
          if (item.qty > 1) item.qty--;
          saveCartToStorage(cart);
          manualRenderCart();
          triggerOriginalRenderCart();
        });
      }

      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          cart.splice(index, 1);
          saveCartToStorage(cart);
          manualRenderCart();
          triggerOriginalRenderCart();
        });
      }

      quoteContent.appendChild(clone);
      console.log(`[Quote Cart] ✅ Item rendered: ${item.title} (qty: ${item.qty})`);
    });

    console.log(`[Quote Cart] ✅ Total items rendered: ${cart.length}`);

    // Update title and empty state
    const updateTitle = () => {
      const titleEl = quoteModal.querySelector('[data-quote-title]');
      if (titleEl) {
        const itemCount = cart.length;
        titleEl.textContent = itemCount === 0 ? 'QUOTE (0 ITEMS)' : `QUOTE (${itemCount} ${itemCount === 1 ? 'ITEM' : 'ITEMS'})`;
      }
    };

    const toggleEmptyState = () => {
      const emptyWrapper = quoteContent.querySelector('[quote-empty]');
      const actionsBlock = quoteModal.querySelector('.quote_modal-content-bottom');
      if (emptyWrapper) {
        emptyWrapper.style.display = cart.length === 0 ? 'flex' : 'none';
      }
      if (actionsBlock) {
        actionsBlock.style.display = cart.length === 0 ? 'none' : 'block';
      }
      // Also hide the template item if it's visible
      const templateItem = quoteModal.querySelector('[data-quote-item]');
      if (templateItem && cart.length > 0) {
        templateItem.style.display = 'none';
      }
    };

    updateTitle();
    toggleEmptyState();
  }

  // Function to trigger the original renderCart from initQuoteSystem
  // Since renderCart is in a closure, we call initQuoteSystem again which will reload cart and render
  function triggerOriginalRenderCart() {
    if (typeof window.initQuoteSystem === 'function') {
      // Re-initialize to trigger renderCart (it will load cart from localStorage and render)
      window.initQuoteSystem();
      // Also enhance the rendering after original renderCart runs
      setTimeout(() => {
        // Check if items were rendered, if not, use manual render
        const quoteContent = document.querySelector('.quote_modal-content');
        if (quoteContent) {
          const renderedItems = quoteContent.querySelectorAll('.quote_item:not([style*="display: none"])');
          let cart = [];
          try {
            const saved = localStorage.getItem('quoteCart');
            if (saved) {
              cart = JSON.parse(saved);
              if (!Array.isArray(cart)) cart = [];
            }
          } catch {
            cart = [];
          }

          // If cart has items but none were rendered, use manual render
          if (cart.length > 0 && renderedItems.length === 0) {
            console.log('[Quote Cart] ⚠️ renderCart failed, using manual render');
            manualRenderCart();
          } else if (cart.length > 0) {
            console.log('[Quote Cart] ✅ Items rendered successfully, enhancing...');
            enhanceRenderCart();
            renderedItems.forEach(fixItemElements);
          } else {
            console.log('[Quote Cart] ℹ️ Cart is empty');
          }
        }
      }, 200);
    }
  }

  function initQuantityControl(container) {
    if (processed.has(container)) return;
    processed.add(container);

    const minusBtn = container.querySelector('.spare-part-qty-minus');
    const qtyInput = container.querySelector('.spare-part-qty-input');
    const plusBtn = container.querySelector('.spare-part-qty-plus');

    if (!minusBtn || !qtyInput || !plusBtn) return;

    qtyInput.type = 'number';
    qtyInput.min = '0';
    qtyInput.value = '0';
    
    let isProgrammaticChange = false;
    const controlRef = { isProgrammaticChange: false };
    container._sparePartControl = controlRef;
    
    Object.defineProperty(controlRef, 'isProgrammaticChange', {
      get: () => isProgrammaticChange,
      set: (val) => { isProgrammaticChange = val; }
    });

    function getSparePartDescription() {
      const selectors = ['.card_description', '[data-quote-description]', '.spare-part-description'];
      for (const selector of selectors) {
        const element = container.querySelector(selector);
        if (element) {
          const text = element.textContent.trim();
          if (isValidSparePartName(text)) {
            return text;
          }
        }
      }
      return '';
    }

    function performQuoteUpdate(title, description, newQty) {
      let cart = [];
      try {
        const saved = localStorage.getItem('quoteCart');
        if (saved) cart = JSON.parse(saved);
      } catch (err) {
        cart = [];
      }

      const existingIndex = cart.findIndex(item => {
        if (!item || !item.title) return false;
        return item.title.trim().toLowerCase() === title.trim().toLowerCase();
      });
      const existing = existingIndex >= 0 ? cart[existingIndex] : null;
      const wasNewItem = !existing;
      const previousQty = existing ? existing.qty : 0;

      let sparePartContentHTML = '';
      if (newQty > 0) {
        sparePartContentHTML = getSparePartContentHTML(container);
        if (existing && !existing.sparePartContentHTML && sparePartContentHTML) {
          existing.sparePartContentHTML = sparePartContentHTML;
        }
      }

      if (newQty > 0) {
        if (existing) {
          existing.qty = newQty;
          existing.isSparePart = true;
          if (!sparePartContentHTML && existing.sparePartContentHTML) {
            sparePartContentHTML = existing.sparePartContentHTML;
          }
          if (sparePartContentHTML) {
            existing.sparePartContentHTML = sparePartContentHTML;
          }
          // Log: Item quantity updated
          console.log(`[Quote Cart] Item updated: "${title}" - Quantity: ${previousQty} → ${newQty} | Total items: ${cart.length}`);
        } else {
          cart.push({ 
            title, 
            description, 
            qty: newQty, 
            isSparePart: true,
            sparePartContentHTML: sparePartContentHTML 
          });
          // Log: Item added
          console.log(`[Quote Cart] ✅ Item ADDED: "${title}" - Quantity: ${newQty} | Total items: ${cart.length}`);
        }
      } else {
        if (existingIndex >= 0) {
          cart.splice(existingIndex, 1);
          // Log: Item removed
          console.log(`[Quote Cart] ❌ Item REMOVED: "${title}" | Total items: ${cart.length}`);
        }
      }

      saveCartToStorage(cart);
      
      // Always update nav quantity
      updateNavQtyFromCart(cart);
      
      // Dispatch event to update quote system
      document.dispatchEvent(new CustomEvent('quoteCartUpdated', {
        detail: { cart, changedItem: { title, description, qty: newQty }, source: 'spare-parts' },
        bubbles: true
      }));

      // Trigger original renderCart to display item immediately (e-commerce style)
      // This ensures the item appears in the modal right away
      setTimeout(() => {
        triggerOriginalRenderCart();
      }, 50);

      // Open modal automatically when item is first added (e-commerce style)
      // This creates the e-commerce experience: add item → see it in cart immediately
      if (wasNewItem && newQty > 0) {
        setTimeout(() => {
          openQuoteModal();
        }, 200);
      }
    }

    function updateQuote(newQty) {
      let title = getSparePartTitle(container);
      let description = getSparePartDescription();
      
      if (title === 'Unnamed spare part') {
        let attempts = 0;
        const maxAttempts = 3;
        const checkName = () => {
          attempts++;
          title = getSparePartTitle(container);
          description = getSparePartDescription();
          
          if (title !== 'Unnamed spare part' || attempts >= maxAttempts) {
            performQuoteUpdate(title, description, newQty);
          } else {
            setTimeout(checkName, 250);
          }
        };
        setTimeout(checkName, 200);
        return;
      }
      
      performQuoteUpdate(title, description, newQty);
    }

    function validateInput() {
      const val = parseInt(qtyInput.value, 10);
      if (isNaN(val) || val < 0) {
        qtyInput.value = '0';
        return 0;
      }
      return val;
    }

    let updateTimeout = null;
    function debouncedUpdate() {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        updateQuote(validateInput());
      }, 300);
    }

    function handleButtonClick(delta) {
      const currentValue = parseInt(qtyInput.value, 10) || 0;
      const newValue = currentValue + delta;
      if (newValue >= 0) {
        isProgrammaticChange = true;
        qtyInput.value = newValue;
        updateQuote(validateInput());
        setTimeout(() => { isProgrammaticChange = false; }, 100);
      }
    }

    minusBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleButtonClick(-1);
    });

    plusBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleButtonClick(1);
    });

    qtyInput.addEventListener('change', () => {
      if (isProgrammaticChange) return;
      updateQuote(validateInput());
    });

    qtyInput.addEventListener('blur', () => {
      if (isProgrammaticChange) return;
      updateQuote(validateInput());
    });

    qtyInput.addEventListener('input', () => {
      if (isProgrammaticChange) return;
      debouncedUpdate();
    });

    qtyInput.addEventListener('wheel', (e) => e.target.blur());
    qtyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        qtyInput.blur();
      }
    });

    // Sync with cart after CMS loads
    let syncAttempts = 0;
    const maxSyncAttempts = 3;
    function trySyncWithCart() {
      syncAttempts++;
      const title = getSparePartTitle(container);
      
      if (title === 'Unnamed spare part' && syncAttempts < maxSyncAttempts) {
        setTimeout(trySyncWithCart, 400);
        return;
      }
      
      setTimeout(() => {
        const titleKey = title.toLowerCase().trim();
        if (titleKey && titleKey !== 'unnamed spare part') {
          sparePartInputs.set(titleKey, qtyInput);
          syncSparePartsWithCart();
        }
      }, 100);
    }
    
    setTimeout(trySyncWithCart, 800);
  }

  function init() {
    const sparePartItems = document.querySelectorAll('[spare-part-item]');
    const directInputs = document.querySelectorAll('.spare-part-qty-input');
    
    sparePartItems.forEach((item) => {
      if (item.querySelector('.spare-part-qty-input') && !processed.has(item)) {
        initQuantityControl(item);
      }
    });

    directInputs.forEach((input) => {
      const sparePartItem = input.closest('[spare-part-item]');
      if (sparePartItem && !processed.has(sparePartItem)) {
        initQuantityControl(sparePartItem);
      }
    });
  }

  function ensureAllSparePartsInCart() {
    document.querySelectorAll('[spare-part-item]').forEach((item) => {
      const qtyInput = item.querySelector('.spare-part-qty-input');
      if (qtyInput) {
        const qty = parseInt(qtyInput.value, 10) || 0;
        if (qty > 0) {
          const title = getSparePartTitle(item);
          if (title !== 'Unnamed spare part') {
            let cart = [];
            try {
              const saved = localStorage.getItem('quoteCart');
              if (saved) cart = JSON.parse(saved);
            } catch {
              cart = [];
            }
            
            const existing = cart.find(item => {
              if (!item || !item.title) return false;
              return item.title.trim().toLowerCase() === title.trim().toLowerCase();
            });
            
            if (!existing || existing.qty !== qty) {
              qtyInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        }
      }
    });
  }

  function openQuoteModal() {
    const modalGroup = document.querySelector('[data-modal-group-status]');
    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    
    ensureAllSparePartsInCart();
    
    setTimeout(() => {
      if (modalGroup) modalGroup.setAttribute('data-modal-group-status', 'active');
      if (quoteModal) {
        quoteModal.setAttribute('data-modal-status', 'active');
        setTimeout(() => {
          triggerOriginalRenderCart();
          updateNavQtyFromCart();
          syncSparePartsWithCart();
        }, 300);
      }
    }, 200);
  }

  function updateNavQtyFromCart(cartParam) {
    const navQty = document.querySelector("[data-nav-quote-qty]");
    if (!navQty) return;

    let cart = cartParam;
    if (!cart) {
      try {
        const saved = localStorage.getItem('quoteCart');
        if (saved) {
          cart = JSON.parse(saved);
          if (!Array.isArray(cart)) cart = [];
        } else {
          cart = [];
        }
      } catch {
        cart = [];
      }
    }

    if (cart.length === 0) {
      navQty.style.display = "none";
      navQty.textContent = "";
    } else {
      navQty.style.display = "flex";
      navQty.textContent = cart.length;
    }
  }

  // Intercept and fix the original renderCart to prevent null errors
  function interceptRenderCart() {
    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    if (!quoteModal) return;

    const quoteContent = quoteModal.querySelector('.quote_modal-content');
    if (!quoteContent) return;

    // Observe when items are added to the quote content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList && node.classList.contains('quote_item')) {
            // New item was added, fix it after a short delay to ensure it's fully rendered
            setTimeout(() => {
              fixItemElements(node);
            }, 10);
          }
        });
      });
    });

    observer.observe(quoteContent, {
      childList: true,
      subtree: false
    });
  }

  // Fix null element errors in a single item
  function fixItemElements(item) {
    if (!item) return;

    // Get cart to find the item data
    let cart = [];
    try {
      const saved = localStorage.getItem('quoteCart');
      if (saved) {
        cart = JSON.parse(saved);
        if (!Array.isArray(cart)) cart = [];
      }
    } catch {
      cart = [];
    }

    // Get elements safely
    const titleEl = item.querySelector('[data-quote-title]');
    const descEl = item.querySelector('[data-quote-description]');
    const qtyEl = item.querySelector('[data-quote-number]');
    
    // Get current title to match with cart
    const titleText = titleEl ? titleEl.textContent.trim() : '';
    
    // Find matching item in cart - try multiple strategies
    let cartItem = cart.find(ci => {
      if (!ci || !ci.title) return false;
      return ci.title.trim().toLowerCase() === titleText.toLowerCase() ||
             (ci.isSparePart && titleText.toLowerCase().includes(ci.title.toLowerCase()));
    });

    if (!cartItem) {
      // Try to find by index if title doesn't match
      const quoteContent = document.querySelector('.quote_modal-content');
      if (!quoteContent) return;
      const allItems = quoteContent.querySelectorAll('.quote_item');
      const itemIndex = Array.from(allItems).indexOf(item);
      if (itemIndex >= 0 && itemIndex < cart.length) {
        cartItem = cart[itemIndex];
      }
    }

    if (!cartItem) {
      // Last resort: try to find any spare part if this looks like one
      if (item.querySelector('.spare-part-content-wrap') || 
          item.querySelector('[spare-part-content]')) {
        cartItem = cart.find(ci => ci.isSparePart);
      }
    }

    if (cartItem) {
      const matchedItem = cartItem;
      
      // Update elements safely
      if (titleEl) {
        try {
          titleEl.textContent = matchedItem.title || '';
        } catch (e) {
          console.warn('[Quote Cart] Error setting title:', e);
        }
      }
      
      if (descEl) {
        try {
          descEl.textContent = matchedItem.description || '';
        } catch (e) {
          console.warn('[Quote Cart] Error setting description:', e);
        }
      }
      
      if (qtyEl) {
        try {
          qtyEl.textContent = matchedItem.qty || 1;
          const nestedDiv = qtyEl.querySelector('div');
          if (nestedDiv) nestedDiv.textContent = matchedItem.qty || 1;
        } catch (e) {
          console.warn('[Quote Cart] Error setting quantity:', e);
        }
      }

      // If it's a spare part, replace content with custom HTML
      if (matchedItem.isSparePart && matchedItem.sparePartContentHTML) {
        const contentContainer = item.querySelector('[data-quote-part-content]') || 
                                item.querySelector('.quote_item_content') ||
                                item;
        
        if (contentContainer) {
          contentContainer.innerHTML = '';
          contentContainer.insertAdjacentHTML('beforeend', matchedItem.sparePartContentHTML);
          
          // Re-query elements after HTML insertion
          const newTitleEl = item.querySelector('[data-quote-title]');
          const newDescEl = item.querySelector('[data-quote-description]');
          const newQtyEl = item.querySelector('[data-quote-number]');
          
          // Update title if found in new HTML
          if (newTitleEl && !newTitleEl.textContent.trim()) {
            newTitleEl.textContent = matchedItem.title || '';
          }
          
          // Update description if found in new HTML
          if (newDescEl && !newDescEl.textContent.trim()) {
            newDescEl.textContent = matchedItem.description || '';
          }
          
          // Update quantity
          if (newQtyEl) {
            newQtyEl.textContent = matchedItem.qty || 1;
            const nestedDiv = newQtyEl.querySelector('div');
            if (nestedDiv) nestedDiv.textContent = matchedItem.qty || 1;
          }
        }
      }
      return;
    }

    // Update elements safely - only if they exist
    if (titleEl) {
      try {
        titleEl.textContent = cartItem.title || '';
      } catch (e) {
        console.warn('[Quote Cart] Error setting title:', e);
      }
    } else {
      console.warn('[Quote Cart] [data-quote-title] element not found in item');
    }

    if (descEl) {
      try {
        descEl.textContent = cartItem.description || '';
      } catch (e) {
        console.warn('[Quote Cart] Error setting description:', e);
      }
    } else {
      console.warn('[Quote Cart] [data-quote-description] element not found in item');
    }

    if (qtyEl) {
      try {
        qtyEl.textContent = cartItem.qty || 1;
        const nestedDiv = qtyEl.querySelector('div');
        if (nestedDiv) nestedDiv.textContent = cartItem.qty || 1;
      } catch (e) {
        console.warn('[Quote Cart] Error setting quantity:', e);
      }
    } else {
      console.warn('[Quote Cart] [data-quote-number] element not found in item');
    }

    // If it's a spare part, replace content with custom HTML
    if (cartItem.isSparePart && cartItem.sparePartContentHTML) {
      const contentContainer = item.querySelector('[data-quote-part-content]') || 
                              item.querySelector('.quote_item_content') ||
                              item;
      
      if (contentContainer) {
        contentContainer.innerHTML = '';
        contentContainer.insertAdjacentHTML('beforeend', cartItem.sparePartContentHTML);
        
        // After inserting HTML, ensure quantity is still set correctly
        const newQtyEl = item.querySelector('[data-quote-number]');
        if (newQtyEl) {
          newQtyEl.textContent = cartItem.qty || 1;
          const nestedDiv = newQtyEl.querySelector('div');
          if (nestedDiv) nestedDiv.textContent = cartItem.qty || 1;
        }
      }
    }
  }

  // Patch the renderCart function to add null checks
  function patchRenderCart() {
    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    if (!quoteModal) return;

    const quoteContent = quoteModal.querySelector('.quote_modal-content');
    const templateItem = quoteModal.querySelector('[data-quote-item]');
    if (!quoteContent || !templateItem) return;

    // Store original appendChild to intercept when items are added
    const originalAppendChild = quoteContent.appendChild.bind(quoteContent);
    
    quoteContent.appendChild = function(child) {
      // Call original appendChild
      const result = originalAppendChild(child);
      
      // If it's a quote_item, fix it immediately
      if (child.classList && child.classList.contains('quote_item')) {
        // Fix elements before they cause errors
        setTimeout(() => {
          fixItemElements(child);
        }, 0);
      }
      
      return result;
    };
  }

  // Enhance the original initQuoteSystem to support spare parts
  function enhanceQuoteSystem() {
    if (typeof window.initQuoteSystem !== 'function') return;

    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    if (!quoteModal) return;

    const quoteContent = quoteModal.querySelector('.quote_modal-content');
    const templateItem = quoteModal.querySelector('[data-quote-item]');
    const templatePartItem = quoteModal.querySelector('[data-quote-part-item]');
    if (!quoteContent || !templateItem) return;

    // Store original initQuoteSystem
    const originalInitQuoteSystem = window.initQuoteSystem;
    
    // Override to add spare parts support and fix null errors
    window.initQuoteSystem = function() {
      // Patch renderCart before calling original
      patchRenderCart();
      
      // Call original function
      originalInitQuoteSystem();
      
      // After original renderCart runs, enhance spare parts rendering
      // and fix any null element errors
      setTimeout(() => {
        enhanceRenderCart();
        // Fix any items that were just rendered
        const renderedItems = quoteContent.querySelectorAll('.quote_item');
        renderedItems.forEach(fixItemElements);
      }, 100);
    };

    // Intercept renderCart to prevent null errors
    interceptRenderCart();
  }

  // Enhance the renderCart function by intercepting when it runs
  // This ensures spare parts are rendered with their custom HTML content
  function enhanceRenderCart() {
    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    const quoteContent = quoteModal?.querySelector('.quote_modal-content');
    const templatePartItem = quoteModal?.querySelector('[data-quote-part-item]');
    
    if (!quoteContent) return;

    // After original renderCart runs, enhance spare parts rendering
    setTimeout(() => {
      let cart = [];
      try {
        const saved = localStorage.getItem('quoteCart');
        if (saved) {
          cart = JSON.parse(saved);
          if (!Array.isArray(cart)) cart = [];
        }
      } catch (err) {
        cart = [];
      }

      // Find spare parts that need special rendering
      cart.forEach((item) => {
        if (item.isSparePart && item.sparePartContentHTML) {
          // Find the rendered item in the DOM by title
          const renderedItems = quoteContent.querySelectorAll('.quote_item');
          renderedItems.forEach((renderedItem) => {
            const titleEl = renderedItem.querySelector('[data-quote-title]');
            const titleText = titleEl ? titleEl.textContent.trim() : '';
            
            // Match by title or check if it's a spare part by content
            if (titleText === item.title || item.isSparePart) {
              // This is a spare part, enhance it with custom HTML
              const contentContainer = renderedItem.querySelector('[data-quote-part-content]') || 
                                      renderedItem.querySelector('.quote_item_content') ||
                                      renderedItem;
              
              if (contentContainer && item.sparePartContentHTML) {
                // Replace content with spare part HTML
                contentContainer.innerHTML = '';
                contentContainer.insertAdjacentHTML('beforeend', item.sparePartContentHTML);
                
                // Ensure quantity is displayed correctly
                const qtyEl = renderedItem.querySelector('[data-quote-number]');
                if (qtyEl) {
                  qtyEl.textContent = item.qty || 1;
                  const nestedDiv = qtyEl.querySelector('div');
                  if (nestedDiv) nestedDiv.textContent = item.qty || 1;
                }
              }
            }
          });
        }
      });
    }, 50);
  }

  // Listen for modal opening to ensure cart is rendered
  function initModalOpenListener() {
    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    if (!quoteModal) {
      console.log('[Quote Cart] ⚠️ Quote modal not found for observer');
      return;
    }

    console.log('[Quote Cart] ✅ Setting up modal open listener');

    const modalObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-modal-status') {
          const status = quoteModal.getAttribute('data-modal-status');
          console.log(`[Quote Cart] 🔍 Modal status changed: ${status}`);
          
          if (status === 'active') {
            console.log('[Quote Cart] 🔓 Modal opened - checking cart and rendering...');
            
            ensureAllSparePartsInCart();
            
            setTimeout(() => {
              // Log cart status when modal opens
              logCartStatus('🔓 Modal opened - ');
              
              // Always try manual render first to ensure it works
              console.log('[Quote Cart] 🔄 Calling manualRenderCart() when modal opened');
              manualRenderCart();
              
              // Also trigger original render as backup
              triggerOriginalRenderCart();
              
              // Double-check after a delay
              setTimeout(() => {
                const quoteContent = document.querySelector('.quote_modal-content');
                if (quoteContent) {
                  const renderedItems = quoteContent.querySelectorAll('.quote_item:not([style*="display: none"])');
                  let cart = [];
                  try {
                    const saved = localStorage.getItem('quoteCart');
                    if (saved) {
                      cart = JSON.parse(saved);
                      if (!Array.isArray(cart)) cart = [];
                    }
                  } catch {
                    cart = [];
                  }
                  
                  console.log(`[Quote Cart] 🔍 After render: ${renderedItems.length} items rendered, ${cart.length} items in cart`);
                  
                  if (cart.length > 0 && renderedItems.length === 0) {
                    console.log('[Quote Cart] ⚠️ Cart has items but none rendered, forcing manual render again');
                    manualRenderCart();
                  } else if (cart.length > 0 && renderedItems.length > 0) {
                    console.log('[Quote Cart] ✅ Modal opened with items rendered successfully');
                  } else if (cart.length === 0) {
                    console.log('[Quote Cart] ℹ️ Modal opened but cart is empty');
                  }
                }
              }, 500);
              
              updateNavQtyFromCart();
              syncSparePartsWithCart();
            }, 300);
          }
        }
      });
    });

    modalObserver.observe(quoteModal, {
      attributes: true,
      attributeFilter: ['data-modal-status']
    });
    
    console.log('[Quote Cart] ✅ Modal observer set up');
  }

  // Event delegation for navigation buttons
  let navButtonHandlerAttached = false;
  function initNavigationButtonHandler() {
    if (navButtonHandlerAttached) return;
    navButtonHandlerAttached = true;

    document.addEventListener('click', function(e) {
      const target = e.target.closest('[data-modal-target="quote-modal"]');
      if (!target || target.hasAttribute('data-nav-quote-handled')) return;
      
      target.setAttribute('data-nav-quote-handled', 'true');
      ensureAllSparePartsInCart();
      
      setTimeout(() => {
        triggerOriginalRenderCart();
        updateNavQtyFromCart();
        document.dispatchEvent(new CustomEvent('quoteCartUpdated', {
          detail: { openModal: true },
          bubbles: true
        }));
      }, 200);
    }, true);
  }

  // Observer for DOM changes
  const observer = new MutationObserver((mutations) => {
    let shouldReinit = false;
    
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const hasControl = (node.querySelector && node.querySelector('.spare-part-qty-input')) ||
                              (node.classList && node.classList.contains('spare-part-qty-input'));
            if (hasControl && !processed.has(node)) {
              shouldReinit = true;
            }
          }
        });
      }
    });
    
    if (shouldReinit) {
      setTimeout(init, 200);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });

  // Modal sync for quantity changes in modal
  function initModalSync() {
    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    const quoteContent = quoteModal?.querySelector('.quote_modal-content');
    if (!quoteContent) return;
    
    quoteContent.addEventListener('click', (e) => {
      const target = e.target;
      const isPlus = target.closest('.quote_plus');
      const isMinus = target.closest('.quote_minus');
      const isRemove = target.closest('[data-quote-remove]');
      
      if (isPlus || isMinus || isRemove) {
        setTimeout(() => {
          // Log cart status after modal action
          const cart = logCartStatus('🔄 Modal action - ');
          syncSparePartsWithCart();
          triggerOriginalRenderCart();
        }, 150);
      }
    });
  }

  function tryEnhanceQuoteSystem() {
    if (typeof window.initQuoteSystem === 'function') {
      enhanceQuoteSystem();
      initModalOpenListener();
      return true;
    }
    return false;
  }

  // Function to log cart status
  const logCartStatusCache = new Set(); // Cache to prevent duplicate logs
  let lastLogTime = 0;
  const LOG_COOLDOWN = 2000; // 2 seconds cooldown
  
  function logCartStatus(context = '') {
    const now = Date.now();
    const cacheKey = context.trim();
    
    // Prevent duplicate logs within cooldown period
    if (logCartStatusCache.has(cacheKey) || (now - lastLogTime < LOG_COOLDOWN && cacheKey === '📦 Page loaded - ')) {
      return [];
    }
    
    logCartStatusCache.add(cacheKey);
    lastLogTime = now;
    setTimeout(() => logCartStatusCache.delete(cacheKey), LOG_COOLDOWN);
    
    try {
      const saved = localStorage.getItem('quoteCart');
      let cart = [];
      if (saved) {
        cart = JSON.parse(saved);
        if (!Array.isArray(cart)) cart = [];
      }
      const itemCount = cart.length;
      const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
      console.log(`[Quote Cart] ${context}Total items: ${itemCount} | Total quantity: ${totalQty}`, cart.length > 0 ? cart : '');
      return cart;
    } catch (err) {
      console.log(`[Quote Cart] ${context}Error reading cart:`, err);
      return [];
    }
  }

  let initAllCalled = false; // Flag to prevent duplicate initialization

  // Function to close modal (support for data-modal-close buttons)
  function closeQuoteModal() {
    console.log('[Quote Cart] 🔒 Closing quote modal...');
    console.log('[Quote Cart]   - Function called from:', new Error().stack.split('\n')[2]?.trim() || 'unknown');
    
    // Find and close the quote modal by setting its attributes
    const modalGroup = document.querySelector('[data-modal-group-status]');
    const quoteModal = document.querySelector('[data-modal-name="quote-modal"]');
    
    console.log('[Quote Cart]   - Modal group found:', !!modalGroup);
    console.log('[Quote Cart]   - Quote modal found:', !!quoteModal);
    
    if (modalGroup) {
      const currentStatus = modalGroup.getAttribute('data-modal-group-status');
      console.log('[Quote Cart]   - Modal group current status:', currentStatus);
      modalGroup.setAttribute('data-modal-group-status', 'not-active');
      const newStatus = modalGroup.getAttribute('data-modal-group-status');
      console.log('[Quote Cart]   - Modal group new status:', newStatus);
      console.log('[Quote Cart] ✅ Modal group set to not-active');
    } else {
      console.log('[Quote Cart] ⚠️ Modal group not found');
    }
    
    if (quoteModal) {
      const currentStatus = quoteModal.getAttribute('data-modal-status');
      console.log('[Quote Cart]   - Quote modal current status:', currentStatus);
      quoteModal.setAttribute('data-modal-status', 'not-active');
      const newStatus = quoteModal.getAttribute('data-modal-status');
      console.log('[Quote Cart]   - Quote modal new status:', newStatus);
      console.log('[Quote Cart] ✅ Quote modal set to not-active');
    } else {
      console.log('[Quote Cart] ⚠️ Quote modal not found');
    }
    
    // Also close any other active modals in the same group
    if (modalGroup) {
      const activeModals = modalGroup.querySelectorAll('[data-modal-status="active"]');
      console.log('[Quote Cart]   - Found', activeModals.length, 'active modals in group');
      activeModals.forEach((modal, index) => {
        modal.setAttribute('data-modal-status', 'not-active');
        console.log(`[Quote Cart] ✅ Closed additional modal ${index + 1}:`, modal);
      });
    }
    
    // Verify the modal is actually closed
    setTimeout(() => {
      const verifyModal = document.querySelector('[data-modal-name="quote-modal"]');
      const verifyGroup = document.querySelector('[data-modal-group-status]');
      if (verifyModal) {
        const finalStatus = verifyModal.getAttribute('data-modal-status');
        const groupStatus = verifyGroup?.getAttribute('data-modal-group-status');
        console.log('[Quote Cart] 🔍 Verification - Modal status:', finalStatus, '| Group status:', groupStatus);
        if (finalStatus === 'not-active' && groupStatus === 'not-active') {
          console.log('[Quote Cart] ✅ Modal successfully closed');
        } else {
          console.log('[Quote Cart] ⚠️ Modal may not be fully closed');
        }
      }
    }, 100);
  }

  // Initialize modal close buttons (ensure they work correctly)
  function initModalCloseButtons() {
    console.log('[Quote Cart] 🔧 Initializing modal close buttons...');
    
    // Function to close modal - SIMPLIFIED
    function handleCloseClick(e) {
      // Check if clicked element or any parent has data-modal-close
      let element = e.target;
      
      // Walk up the DOM tree to find data-modal-close
      while (element && element !== document) {
        // Use getAttribute instead of hasAttribute for better compatibility
        if (element.getAttribute && element.getAttribute('data-modal-close') !== null) {
          console.log('[Quote Cart] ✅ FOUND CLOSE BUTTON:', element);
          console.log('[Quote Cart]   - Element:', element);
          console.log('[Quote Cart]   - Classes:', element.className);
          
          // Stop all propagation IMMEDIATELY
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          console.log('[Quote Cart] ✅ Calling closeQuoteModal()...');
          closeQuoteModal();
          
          return false;
        }
        element = element.parentElement || element.parentNode;
      }
    }
    
    // Attach to document with capture phase (runs first)
    document.addEventListener('click', handleCloseClick, true);
    console.log('[Quote Cart] ✅ Global click handler attached to document (capture phase)');
    
    // Also attach directly to all existing close buttons - FORCE ATTACHMENT
    function attachToAllButtons() {
      const closeButtons = document.querySelectorAll('[data-modal-close]');
      console.log(`[Quote Cart] 🔍 attachToAllButtons: Found ${closeButtons.length} close buttons`);
      
      if (closeButtons.length === 0) {
        console.log('[Quote Cart] ⚠️ No close buttons found! Modal may not be loaded yet.');
        return;
      }
      
      closeButtons.forEach((btn, index) => {
        console.log(`[Quote Cart]   - Processing button ${index + 1}:`, {
          element: btn,
          tag: btn.tagName,
          classes: btn.className,
          hasAttribute: btn.getAttribute('data-modal-close') !== null,
          visible: btn.offsetParent !== null
        });
        
        // Remove any existing listener
        if (btn._quoteCartHandler) {
          btn.removeEventListener('click', btn._quoteCartHandler, true);
          console.log(`[Quote Cart]     - Removed old listener from button ${index + 1}`);
        }
        
        // Create handler
        const handler = function(e) {
          console.log(`[Quote Cart] 🔘 DIRECT CLICK on button ${index + 1}:`, btn);
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('[Quote Cart] ✅ Calling closeQuoteModal() from direct listener...');
          closeQuoteModal();
          return false;
        };
        
        // Attach with capture phase (runs BEFORE bubble phase)
        btn.addEventListener('click', handler, true);
        btn._quoteCartHandler = handler;
        console.log(`[Quote Cart]     ✅ Direct listener attached to button ${index + 1} (capture phase)`);
      });
      
      console.log(`[Quote Cart] ✅ Total: ${closeButtons.length} buttons have direct listeners`);
    }
    
    // Attach immediately
    attachToAllButtons();
    
    // Retry after delays (in case modal loads later)
    setTimeout(() => {
      console.log('[Quote Cart] 🔄 Retrying attachToAllButtons after 500ms...');
      attachToAllButtons();
    }, 500);
    
    setTimeout(() => {
      console.log('[Quote Cart] 🔄 Retrying attachToAllButtons after 2000ms...');
      attachToAllButtons();
    }, 2000);
    
    // Also watch for dynamically added buttons
    const observer = new MutationObserver((mutations) => {
      let shouldRetry = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.getAttribute && node.getAttribute('data-modal-close') !== null) {
                shouldRetry = true;
              } else if (node.querySelector && node.querySelector('[data-modal-close]')) {
                shouldRetry = true;
              }
            }
          });
        }
      });
      if (shouldRetry) {
        console.log('[Quote Cart] 🔄 New close buttons detected, reattaching...');
        attachToAllButtons();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('[Quote Cart] ✅ MutationObserver set up for dynamic buttons');
    
    // Also add direct listeners to existing close buttons as backup
    function attachDirectListeners() {
      const closeButtons = document.querySelectorAll('[data-modal-close]');
      console.log(`[Quote Cart] 🔍 attachDirectListeners: Found ${closeButtons.length} close buttons`);
      
      closeButtons.forEach((btn, index) => {
        // Remove any existing listeners first
        if (btn._quoteCartCloseListener) {
          console.log(`[Quote Cart]   - Button ${index + 1} has existing listener, removing it first`);
          btn.removeEventListener('click', btn._quoteCartCloseListener, true);
        }
        
        console.log(`[Quote Cart]   - Attaching direct listener to button ${index + 1}:`, {
          element: btn,
          classes: btn.className,
          visible: btn.offsetParent !== null,
          display: window.getComputedStyle(btn).display,
          pointerEvents: window.getComputedStyle(btn).pointerEvents
        });
        
        // Add click listener with capture phase
        const handler = function(e) {
          console.log('[Quote Cart] 🔘 Direct close button clicked (direct listener):', btn);
          console.log('[Quote Cart]   - Event target:', e.target);
          console.log('[Quote Cart]   - Event currentTarget:', e.currentTarget);
          console.log('[Quote Cart]   - Event phase:', e.eventPhase === 1 ? 'CAPTURE' : e.eventPhase === 2 ? 'TARGET' : 'BUBBLE');
          
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          console.log('[Quote Cart] ✅ Calling closeQuoteModal() from direct listener...');
          closeQuoteModal();
          
          return false;
        };
        
        // Add listener with capture phase (runs before other handlers)
        btn.addEventListener('click', handler, true);
        btn._quoteCartCloseListener = handler; // Mark as having listener
        console.log(`[Quote Cart]   ✅ Direct listener attached to button ${index + 1} (capture phase)`);
      });
      
      if (closeButtons.length > 0) {
        console.log(`[Quote Cart] ✅ Attached direct listeners to ${closeButtons.length} close buttons`);
      } else {
        console.log('[Quote Cart] ⚠️ No close buttons found for direct listeners');
      }
    }
    
    // Attach listeners immediately
    attachDirectListeners();
    
    // Also attach to dynamically added buttons
    const observer = new MutationObserver(() => {
      attachDirectListeners();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('[Quote Cart] ✅ Modal close buttons initialized');
  }

  function initAll() {
    // Prevent duplicate initialization
    if (initAllCalled) return;
    initAllCalled = true;

    init();
    initNavigationButtonHandler();
    initModalSync();
    initModalCloseButtons();
    
    // Log cart status on page load (only once)
    setTimeout(() => {
      logCartStatus('📦 Page loaded - ');
    }, 500);
    
    let enhanceAttempts = 0;
    const maxEnhanceAttempts = 15;
    const enhanceInterval = setInterval(() => {
      enhanceAttempts++;
      if (tryEnhanceQuoteSystem() || enhanceAttempts >= maxEnhanceAttempts) {
        clearInterval(enhanceInterval);
      }
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initAll, 300);
    });
  } else {
    setTimeout(initAll, 300);
  }

  if (typeof Webflow !== 'undefined') {
    Webflow.push(function() {
      // Only call initAll if it hasn't been called yet
      if (!initAllCalled) {
        setTimeout(initAll, 800);
      }
    });
  }
})();
