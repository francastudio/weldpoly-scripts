# Weldpoly Scripts - GitHub Repository

This repository contains JavaScript scripts for the Weldpoly quote system on Webflow.

## 📁 Structure

```
weldpoly-scripts/
├── weldpoly-webflow-core.js    (unified: Lenis + Locomotive + Content reveal)
├── weldpoly-quote-system.js
├── weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js
├── weldpoly-navigation.js
└── weldpoly-finsweet-sort.js
```

## 🚀 How to Use in Webflow

### Step 1: Add to Footer Code

In **Webflow Footer Code** (Site Settings → Custom Code → Footer Code), add:

```html
<script src="https://cdn.jsdelivr.net/gh/lillocal/weldpoly-scripts@main/weldpoly-webflow-core.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/lillocal/weldpoly-scripts@main/weldpoly-quote-system.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/lillocal/weldpoly-scripts@main/weldpoly-spare-parts-quantity-control-FIXED-ECOMMERCE.js" defer></script>
```

**⚠️ IMPORTANT:**
- Maintain the order (quote system first)
- Load Locomotive Scroll, GSAP, ScrollTrigger and Finsweet before these scripts if needed

### Step 2: Publish

1. Save changes
2. Publish the site
3. jsDelivr updates automatically within a few minutes

## 🔄 How to Update

1. Edit the JavaScript files in this repository
2. Commit your changes
3. Push to GitHub
4. To force immediate update, add `?v=2` (or another number) to the URL in Webflow

## ✅ Benefits

- ✅ **Free** - No costs
- ✅ **Global CDN** - Fast everywhere
- ✅ **Easy to update** - Just push to GitHub
- ✅ **Version control** - Full change history

## 🔍 Verification

To verify scripts are loading correctly:

1. Open the browser console (F12)
2. Check for loading errors
3. Type: `typeof window.initQuoteSystem === 'function'`
4. Should return `true`

## 📚 Documentation

For full script list and details, see `AVAILABLE-SCRIPTS.md`.

For Webflow embed code and prerequisites, see `WEBFLOW-CUSTOM-CODE.txt`.
