/**
 * Sets given CSS style on the passed element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import setStyles from './set-styles';

/**
 * @param {HTMLElement|Array<HTMLElement>|NodeList<HTMLElement>} elementOrElements
 * @param {keyof CSSStyleDeclaration} stylePropertyName CSS property name in
 *   camelcase format.
 * @param {string} stylePropertyValue Value for that CSS property.
 * @returns {void}
 */
export default function setStyle(
  elementOrElements,
  stylePropertyName,
  stylePropertyValue,
) {
  setStyles(elementOrElements, {
    [stylePropertyName]: stylePropertyValue,
  });
}
