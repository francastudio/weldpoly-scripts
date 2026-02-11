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

  /** Extract min size in mm from description. Handles "40 to 160mm", "1600mm to 914mm" (both orders) */
  function extractMinMm(str) {
    if (!str || typeof str !== 'string') return Infinity;
    const s = str.trim();
    if (!s) return Infinity;
    // Match range: "X to Ymm" or "Xmm to Ymm" - use the smaller number
    const rangeMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:mm\s*)?to\s*(\d+(?:\.\d+)?)\s*mm/i);
    if (rangeMatch) {
      const a = parseFloat(rangeMatch[1]);
      const b = parseFloat(rangeMatch[2]);
      return Math.min(a, b);
    }
    // Fallback: first number (e.g. "76.2mm to 254mm")
    const m = s.match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : Infinity;
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
              const aMm = extractMinMm(aDesc);
              const bMm = extractMinMm(bDesc);
              const comparison = aMm - bMm;
              return direction === 'desc' ? -comparison : comparison;
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
