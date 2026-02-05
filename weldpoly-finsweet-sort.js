/**
 * Weldpoly Finsweet Alphanumeric Sort
 * Natural sort for product lists using Finsweet Attributes API
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

  window.FinsweetAttributes = window.FinsweetAttributes || [];
  window.FinsweetAttributes.push([
    'list',
    (listInstances) => {
      listInstances.forEach((listInstance) => {
        listInstance.addHook('sort', (items) => {
          if (listInstance.sorting.value.fieldKey === 'name') {
            const direction = listInstance.sorting.value.direction || 'asc';

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
            fieldKey: 'name',
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
