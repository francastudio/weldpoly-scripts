# Scripts Available on GitHub

## 📦 Repository
**GitHub:** https://github.com/francastudio/weldpoly-scripts

All scripts are at the **repository root** (same level, no subfolders).

---

## 📋 Available Scripts

### 1. **weldpoly-quote-system.js** ⭐ UNIFIED
**Function:** Complete quote and modal system (unified)
- Manages cart in `localStorage`
- Renders items in the modal
- Updates quantity in the browser
- Controls add/remove product buttons
- Opens/closes modal automatically
- Handles buttons with `data-modal-target="quote-modal"`
- Handles buttons with `data-add-quote`
- Closes modal via `.modal__btn-close` or `[data-modal-close]`

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-quote-system.js
```

**When to use:**
- ✅ **ALWAYS** - This is the main quote system script
- ✅ Must be loaded BEFORE the spare parts script
- ✅ Unifies quote and modal in a single system

---

### 2. **weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js**
**Function:** Quantity control for spare parts
- Quantity control (-, input, +) for spare parts
- Automatic cart synchronization
- Adds/removes automatically when quantity changes
- Opens modal automatically when item is added

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
```

**When to use:**
- ✅ When you need quantity control for spare parts
- ⚠️ Requires `weldpoly-quote-system.js` to work

---

### 3. **weldpoly-lenis-scroll-control.js**
**Function:** Scroll control in specific sections using Lenis Scroll
- Enables/disables scroll in specific sections
- Supports attributes `data-lenis-scroll="disabled"` or `data-lenis-scroll="enabled"`
- JavaScript API for dynamic control
- Automatically detects new elements added to the DOM
- Compatible with pure Lenis and Locomotive Scroll V5

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-lenis-scroll-control.js
```

**When to use:**
- ✅ When you need to disable scroll in modals, forms or specific sections
- ✅ For dynamic scroll control based on user interactions
- ⚠️ Requires Lenis Scroll or Locomotive Scroll V5 to be loaded

**Usage example:**
```html
<!-- Disable scroll in a section -->
<section data-lenis-scroll="disabled">
  Content without scroll
</section>

<!-- JavaScript -->
<script>
disableLenisScroll('.my-section');
enableLenisScroll('.my-section');
toggleLenisScroll('.my-section');
</script>
```

---

### 4. **weldpoly-navigation.js** (unified)
**Function:** Menu toggle + nav contrast (logo/menu color by section)
- `[data-navigation-toggle="toggle"]` opens/closes, `[data-navigation-toggle="close"]`, ESC closes
- `[data-navigation-status]` active/not-active
- Adds `.nav--over-light` to `.navigation_container` when over light sections
- Light sections: `.background-color-white`, `.background-color-primary`, `[data-nav-contrast="light"]`, etc.
- Debug: `?nav_debug=1` or `window.NAV_CONTRAST_DEBUG = true`

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-navigation.js
```

**When to use:**
- ✅ Replaces weldpoly-nav-contrast.js and weldpoly-centered-nav.js
- ⚠️ Requires CSS: `.navigation_container.nav--over-light` (add to Custom Code)

---

### 5. **weldpoly-locomotive-init.js**
**Function:** Initializes Locomotive Scroll with Lenis
- Creates instance in `window.locomotiveScroll`
- ⚠️ Requires Locomotive Scroll to be loaded first

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-locomotive-init.js
```

---

### 6. **weldpoly-content-reveal.js**
**Function:** Scroll reveal animations with GSAP ScrollTrigger
- `[data-reveal-group]` – element group
- `[data-reveal-group-nested]` – subgroups
- `data-stagger`, `data-distance`, `data-start` for configuration
- ⚠️ Requires GSAP and ScrollTrigger loaded first

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-content-reveal.js
```

---

### 7. **weldpoly-finsweet-sort.js**
**Function:** Alphanumeric (natural) sort in Finsweet lists
- Sorts by `name` field using natural sort (e.g. Item 2 before Item 10)
- ⚠️ Requires Finsweet Attributes List API loaded first

**URL:**
```
https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-finsweet-sort.js
```

---

## 🔧 How to Use in Webflow

### Complete System (Quote + Spare Parts)
```html
<script src="https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-quote-system.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/francastudio/weldpoly-scripts@main/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js" defer></script>
```

⚠️ **IMPORTANT:** Always load `weldpoly-quote-system.js` first!

---

## 📝 File Structure

```
weldpoly-scripts/
├── weldpoly-quote-system.js
├── weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
├── weldpoly-lenis-scroll-control.js
├── weldpoly-navigation.js
├── weldpoly-locomotive-init.js
├── weldpoly-content-reveal.js
└── weldpoly-finsweet-sort.js
```

All scripts are at the **same level**, no subfolders.

---

## 🔄 Updates

The commit SHA in the URL ensures you always use the exact version of the code.

To update, replace the commit SHA in the URL with the latest:
```bash
git log -1 --format="%h"  # In the dist/ directory
```

---

## ✅ Verification

To verify scripts are loading:

1. Open the browser console (F12)
2. Check for loading errors
3. Type: `typeof window.initQuoteSystem === 'function'`
4. Should return: `true`

---

## 🎯 Unified System Features

The `weldpoly-quote-system.js` manages:

### Quote Cart
- ✅ Add products via `[data-add-quote]`
- ✅ Add products via `[data-modal-target="quote-modal"][data-add-quote]`
- ✅ Update quantities in the modal
- ✅ Remove items from cart
- ✅ Persistence in `localStorage`
- ✅ Synchronization across pages

### Modal — 2 Component Templates
Inside `.quote_modal-content` you must have:
1. **`[data-quote-item]`** — product template (class `quote_item`). Used for products added via `[data-add-quote]`.
2. **`[data-quote-part-item]`** — spare part template (class `quote_part-item`). Used for spare parts added via the spare parts script.

Both templates need `[data-quote-title]`, `[data-quote-description]`, `[data-quote-number]`, `.quote_plus`, `.quote_minus`, `[data-quote-remove]`.

**Important:** Set templates to `display: none` by default (in Webflow or via CSS) so they don't appear when the modal opens before the script renders. The scripts clone these elements and only the clones are shown.

### Modal
- ✅ Opens automatically when adding products
- ✅ Closes via `.modal__btn-close` or `[data-modal-close]`
- ✅ Renders cart items automatically (products with quote_item, spare parts with quote_part-item)
- ✅ Updates title with item count
- ✅ Handles empty cart state
- ✅ Vertical scroll inside modal (compatible with Locomotive Scroll)
- ✅ Pauses Locomotive Scroll when modal is open

### Navigation
- ✅ Updates quantity badge in the browser
- ✅ Redirects to `/get-a-quote` on submit
