import globals from 'onedata-gui-common/utils/globals';

export function getSlide(slideName, parent = undefined) {
  let normalizedParent = parent;
  if (!parent || typeof parent === 'string') {
    normalizedParent = parent ?
      globals.document.querySelector(parent) : globals.document.body;
  }
  return normalizedParent.querySelector(`[data-one-carousel-slide-id="${slideName}"]`);
}

export function isSlideActive(slideName, parent = undefined) {
  const slide = getSlide(slideName, parent);
  return slideName && [...slide.classList].any(cls => cls.startsWith('active'));
}
