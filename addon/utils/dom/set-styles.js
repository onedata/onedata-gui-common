/**
 * Sets given CSS styles on the passed element(s).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { normalizeElementsArray } from './commons';

/**
 * @param {HTMLElement|Array<HTMLElement>|NodeList<HTMLElement>} elementOrElements
 * @param {Object<keyof CSSStyleDeclaration, string>} styles Object with CSS
 *   property names (camelcased) and corresponding values.
 * @returns {void}
 */
export default function setStyles(elementOrElements, styles) {
  const elements = normalizeElementsArray(elementOrElements);
  elements.forEach((element) => Object.assign(element.style, styles));
}
