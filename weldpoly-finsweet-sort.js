/**
 * Weldpoly Finsweet Alphanumeric Sort
 * Natural sort for product lists using Finsweet Attributes API
 * - name: natural sort (Item 2 before Item 10)
 * - description: sort by min size in mm (e.g. "40 to 160mm" -> 40, smallest first)
 * Requires: Finsweet Attributes (https://attributes.finsweet.com/list/list.js)
 * Docs: https://github.com/finsweet/attributes/blob/master/packages/list/README.md
 */
(function() {
  'use strict';

  function naturalSort(a, b) {
    const aStr = String(a).toLowerCase();
    const bStr = String(b).toLowerCase();
    const regex = /(\d+|\D+)/g;
    const aParts = aStr.match(regex) || [];
    const bParts = bStr.match(regex) || [];
    const maxLength = Math.max(aParts.length, bParts.length);

    for (let i = 0; i < maxLength; i++) {
      const aPart = aParts[i] || '';
      const bPart = bParts[i] || '';
      const aNum = parseInt(aPart, 10);
      const bNum = parseInt(bPart, 10);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        if (aNum !== bNum) return aNum - bNum;
      } else {
        if (aPart !== bPart) return aPart < bPart ? -1 : 1;
      }
    }
    return 0;
  }

  /** Extract { min, max } in mm from description. Handles "40 to 160mm", "1600mm to 914mm", "90-630mm" */
  function extractMinMaxMm(str) {
    const fallback = { min: Infinity, max: Infinity };
    if (!str || typeof str !== 'string') return fallback;
    const s = str.trim();
    if (!s) return fallback;
    // Match range: "X to Ymm" or "Xmm to Ymm" or "X-Ymm"
    const rangeMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:mm\s*)?(?:to|-)\s*(\d+(?:\.\d+)?)\s*mm/i) ||
      s.match(/(\d+(?:\.\d+)?)\s+to\s+(\d+(?:\.\d+)?)\s*mm/i);
    if (rangeMatch) {
      const a = parseFloat(rangeMatch[1]);
      const b = parseFloat(rangeMatch[2]);
      return { min: Math.min(a, b), max: Math.max(a, b) };
    }
    // Fallback: single number
    const m = s.match(/(\d+(?:\.\d+)?)/);
    const n = m ? parseFloat(m[1]) : Infinity;
    return { min: n, max: n };
  }

  window.FinsweetAttributes = window.FinsweetAttributes || [];
  window.FinsweetAttributes.push([
    'list',
    (listInstances) => {
      listInstances.forEach((listInstance) => {
        listInstance.addHook('sort', (items) => {
          const fieldKey = listInstance.sorting.value.fieldKey;
          const direction = listInstance.sorting.value.direction || 'asc';

          if (fieldKey === 'description') {
            const sortedItems = [...items].sort((a, b) => {
              const aDesc = a.fields.description?.value || '';
              const bDesc = b.fields.description?.value || '';
              const aRange = extractMinMaxMm(aDesc);
              const bRange = extractMinMaxMm(bDesc);
              if (aRange.min !== bRange.min) {
                const cmp = aRange.min - bRange.min;
                return direction === 'desc' ? -cmp : cmp;
              }
              // Tiebreaker: same min -> sort by max asc (smaller machine first, e.g. PolySaw630 before PolySaw800)
              const cmpMax = aRange.max - bRange.max;
              return direction === 'desc' ? -cmpMax : cmpMax;
            });
            return sortedItems;
          }

          if (fieldKey === 'name') {
            const sortedItems = [...items].sort((a, b) => {
              const aName = a.fields.name?.value || '';
              const bName = b.fields.name?.value || '';
              const comparison = naturalSort(aName, bName);
              return direction === 'desc' ? -comparison : comparison;
            });
            return sortedItems;
          }

          return items;
        });

        if (!listInstance.sorting.value.fieldKey || listInstance.sorting.value.fieldKey === 'name') {
          listInstance.sorting.value = {
            fieldKey: 'description',
            direction: 'asc',
            interacted: false
          };

          listInstance.triggerHook('sort');
        }

        listInstance.watch(
          () => listInstance.sorting.value,
          () => {}
        );
      });
    }
  ]);
})();
