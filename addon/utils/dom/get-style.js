/**
 * Returns a computed value of a specific CSS property for given element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {HTMLElement} element
 * @param {keyof CSSStyleDeclaration} stylePropertyName CSS property name in
 *   camelcase format.
 * @returns {string}
 */
export default function getStyle(element, stylePropertyName) {
  const computedStyles = window.getComputedStyle(element);
  return computedStyles?.[stylePropertyName] ?? '';
}
