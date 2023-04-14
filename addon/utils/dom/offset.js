/**
 * Gets the current coordinates of the element, relative to the document.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import globals from 'onedata-gui-common/utils/globals';

/**
 * @typedef {Object} DomOffsetResult
 * @param {number} top
 * @param {number} left
 */

/**
 * @param {HTMLElement} element
 * @returns {DomOffsetResult}
 */
export default function offset(element) {
  const boundingClientRect = element.getBoundingClientRect();
  return {
    top: boundingClientRect.top + globals.window.pageYOffset,
    left: boundingClientRect.left + globals.window.pageXOffset,
  };
}
