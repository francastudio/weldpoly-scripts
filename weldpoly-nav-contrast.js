/**
 * Weldpoly Nav Contrast
 * Alterna a cor do logo e do menu quando o nav está sobre seções com fundo claro/branco
 */
(function() {
  // Seções claras: background-color-white | Seções escuras: background-color-black
  const LIGHT_SECTIONS = '.background-color-white, [data-nav-contrast="light"]';

  function initNavContrast() {
    const nav = document.querySelector('.navigation');
    if (!nav) return;

    const lightSections = document.querySelectorAll(LIGHT_SECTIONS);
    if (!lightSections.length) return;

    const navHeight = 80;
    const options = {
      root: null,
      rootMargin: `-${navHeight}px 0px -95% 0px`,
      threshold: 0
    };

    let isOverLight = false;

    const callback = (entries) => {
      const overLight = entries.some(e => e.isIntersecting);
      if (overLight !== isOverLight) {
        isOverLight = overLight;
        nav.classList.toggle('nav--over-light', isOverLight);
      }
    };

    const observer = new IntersectionObserver(callback, options);
    lightSections.forEach(section => observer.observe(section));

    // Fallback: verificar ao carregar (para páginas que começam em seção clara)
    const checkInitial = () => {
      const rect = nav.getBoundingClientRect();
      const checkY = rect.bottom - 10;
      const elAtPoint = document.elementFromPoint(window.innerWidth / 2, checkY);
      if (elAtPoint) {
        const inLightSection = elAtPoint.closest(LIGHT_SECTIONS);
        nav.classList.toggle('nav--over-light', !!inLightSection);
      }
    };
    checkInitial();
    window.addEventListener('load', checkInitial);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavContrast);
  } else {
    initNavContrast();
  }
})();
