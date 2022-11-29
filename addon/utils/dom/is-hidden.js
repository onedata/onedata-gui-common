/**
 * Emulates behavior of `':hidden'` jQuery selector. See more:
 * https://api.jquery.com/hidden-selector/
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import isVisible from './is-visible';

/**
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export default function isHidden(element) {
  return !isVisible(element);
}
