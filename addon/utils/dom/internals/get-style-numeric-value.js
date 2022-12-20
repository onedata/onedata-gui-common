/**
 * Returns numeric value of specific CSS property for given element.
 * It will return meaningful results only for CSS properties having measurable
 * numeric values (like `width`, `paddingTop` etc.).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import getStyle from '../get-style';

/**
 * @param {HTMLElement} element
 * @param {keyof CSSStyleDeclaration} stylePropertyName CSS property name in
 *   camelcase format.
 * @returns {number}
 */
export default function getStyleNumericValue(element, stylePropertyName) {
  return parseFloat(getStyle(element, stylePropertyName));
}
