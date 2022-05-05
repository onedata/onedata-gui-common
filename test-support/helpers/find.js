/**
 * Utils extending find DOM helpers.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { findAll } from '@ember/test-helpers';

/**
 * @param {Array<HTMLElement>} elements
 * @param {string} text
 * @returns {Array<HTMLElement>}
 */
export function filterElementsByText(elements, text) {
  return elements.filter(element => element.innerText.includes(text));
}

/**
 * @param {Array<HTMLElement>} elements
 * @param {string} text
 * @returns {HTMLElement}
 */
export function findInElementsByText(elements, text) {
  return elements.find(element => element.innerText.includes(text));
}

/**
 * @param {string} text
 * @param {string} [selector]
 * @returns {Array<HTMLElement>}
 */
export function findAllByText(text, selector = '*') {
  const elements = findAll(selector);
  return filterElementsByText(elements, text);
}

/**
 * @param {string} text
 * @param {string} [selector]
 * @returns {HTMLElement}
 */
export function findByText(text, selector = '*') {
  const elements = findAll(selector);
  return findInElementsByText(elements, text);
}
