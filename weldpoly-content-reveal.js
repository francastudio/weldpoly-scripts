/**
 * Weldpoly Content Reveal on Scroll
 * GSAP ScrollTrigger reveal animations for [data-reveal-group] elements
 * Requires: GSAP, ScrollTrigger (https://cdn.prod.website-files.com/gsap/3.14.2/gsap.min.js, ScrollTrigger.min.js)
 */
(function() {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('weldpoly-content-reveal: GSAP or ScrollTrigger not loaded');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  function initContentRevealScroll() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      document.querySelectorAll('[data-reveal-group]').forEach(groupEl => {
        const groupStaggerSec = (parseFloat(groupEl.getAttribute('data-stagger')) || 100) / 1000;
        const groupDistance = groupEl.getAttribute('data-distance') || '2em';
        const triggerStart = groupEl.getAttribute('data-start') || 'top 80%';
        const animDuration = 0.8;
        const animEase = 'power4.inOut';

        if (prefersReduced) {
          gsap.set(groupEl, { clearProps: 'all', y: 0, autoAlpha: 1 });
          return;
        }

        const directChildren = Array.from(groupEl.children).filter(el => el.nodeType === 1);
        if (!directChildren.length) {
          gsap.set(groupEl, { y: groupDistance, autoAlpha: 0 });
          ScrollTrigger.create({
            trigger: groupEl,
            start: triggerStart,
            once: true,
            onEnter: () => gsap.to(groupEl, {
              y: 0,
              autoAlpha: 1,
              duration: animDuration,
              ease: animEase,
              onComplete: () => gsap.set(groupEl, { clearProps: 'all' })
            })
          });
          return;
        }

        const slots = [];
        directChildren.forEach(child => {
          const nestedGroup = child.matches('[data-reveal-group-nested]')
            ? child
            : child.querySelector(':scope [data-reveal-group-nested]');

          if (nestedGroup) {
            const includeParent = child.getAttribute('data-ignore') === 'false' || nestedGroup.getAttribute('data-ignore') === 'false';
            slots.push({ type: 'nested', parentEl: child, nestedEl: nestedGroup, includeParent });
          } else {
            slots.push({ type: 'item', el: child });
          }
        });

        slots.forEach(slot => {
          if (slot.type === 'item') {
            const isNestedSelf = slot.el.matches('[data-reveal-group-nested]');
            const d = isNestedSelf ? groupDistance : (slot.el.getAttribute('data-distance') || groupDistance);
            gsap.set(slot.el, { y: d, autoAlpha: 0 });
          } else {
            if (slot.includeParent) gsap.set(slot.parentEl, { y: groupDistance, autoAlpha: 0 });
            const nestedD = slot.nestedEl.getAttribute('data-distance') || groupDistance;
            Array.from(slot.nestedEl.children).forEach(target => gsap.set(target, { y: nestedD, autoAlpha: 0 }));
          }
        });

        slots.forEach(slot => {
          if (slot.type === 'nested' && slot.includeParent) {
            gsap.set(slot.parentEl, { y: groupDistance });
          }
        });

        ScrollTrigger.create({
          trigger: groupEl,
          start: triggerStart,
          once: true,
          onEnter: () => {
            const tl = gsap.timeline();
            slots.forEach((slot, slotIndex) => {
              const slotTime = slotIndex * groupStaggerSec;

              if (slot.type === 'item') {
                tl.to(slot.el, {
                  y: 0,
                  autoAlpha: 1,
                  duration: animDuration,
                  ease: animEase,
                  onComplete: () => gsap.set(slot.el, { clearProps: 'all' })
                }, slotTime);
              } else {
                if (slot.includeParent) {
                  tl.to(slot.parentEl, {
                    y: 0,
                    autoAlpha: 1,
                    duration: animDuration,
                    ease: animEase,
                    onComplete: () => gsap.set(slot.parentEl, { clearProps: 'all' })
                  }, slotTime);
                }
                const nestedMs = parseFloat(slot.nestedEl.getAttribute('data-stagger'));
                const nestedStaggerSec = isNaN(nestedMs) ? groupStaggerSec : nestedMs / 1000;
                Array.from(slot.nestedEl.children).forEach((nestedChild, nestedIndex) => {
                  tl.to(nestedChild, {
                    y: 0,
                    autoAlpha: 1,
                    duration: animDuration,
                    ease: animEase,
                    onComplete: () => gsap.set(nestedChild, { clearProps: 'all' })
                  }, slotTime + nestedIndex * nestedStaggerSec);
                });
              }
            });
          }
        });
      });
    });

    return () => ctx.revert();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContentRevealScroll);
  } else {
    initContentRevealScroll();
  }
})();
