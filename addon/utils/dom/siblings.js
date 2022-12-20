/**
 * Returns an array of element's siblings.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {HTMLElement} element
 * @returns {Array<HTMLElement>}
 */
export default function siblings(element) {
  return [...element.parentElement.children].filter((e) => e !== element);
}
