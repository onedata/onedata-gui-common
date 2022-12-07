/**
 * Emulates behavior of `':visible'` jQuery selector. See more:
 * https://api.jquery.com/visible-selector/
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export default function isVisible(element) {
  return element.offsetWidth > 0 || element.offsetHeight > 0;
}
