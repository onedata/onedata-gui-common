/**
 * Gets the current coordinates of the element relative to some reference
 * element. When reference is not provided, `element.offsetParent` will be used
 * (closest parent with a custom `position` value). If `element.offetParent` is
 * also not defined, then the whole document is taken as a reference.
 *
 * Returned position is a distance from the outer-top-left border corner of the
 * element to the outer-top-left border corner of the reference element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} DomPositionResult
 * @param {number} top
 * @param {number} left
 */

/**
 * @param {HTMLElement} element
 * @param {HTMLElement} [referenceElement]
 * @returns {DomOffsetResult}
 */
export default function offset(element, referenceElement) {
  const normalizedReferenceElement = referenceElement ??
    element.offsetParent ??
    element.ownerDocument.documentElement;
  const referenceBoundingClientRect = normalizedReferenceElement.getBoundingClientRect();
  const elementBoundingClientRect = element.getBoundingClientRect();
  return {
    top: elementBoundingClientRect.top - referenceBoundingClientRect.top,
    left: elementBoundingClientRect.left - referenceBoundingClientRect.left,
  };
}
