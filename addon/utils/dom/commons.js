/**
 * Contains common functions used by DOM utils.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * Converts any type of an HTML elements collection to an array of HTML elements.
 * @param {HTMLElement|Array<HTMLElement>|NodeList<HTMLElement>} elementsArray
 * @returns {Array<HTMLElement>}
 */
export function normalizeElementsArray(elementsArray) {
  if (!elementsArray) {
    return [];
  } else if (Array.isArray(elementsArray)) {
    return elementsArray;
  } else if (typeof elementsArray.length === 'number') {
    return Array.from(elementsArray);
  } else {
    return [elementsArray];
  }
}
