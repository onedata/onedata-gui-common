/**
 * Converts any type of an HTML elements collection to an array of HTML elements.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {HTMLElement|Array<HTMLElement>|NodeList<HTMLElement>} elementsArray
 * @returns {Array<HTMLElement>}
 */
export default function normalizeElementsArray(elementsArray) {
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
