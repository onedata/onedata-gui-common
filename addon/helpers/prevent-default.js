/**
 * Just preventDefault action of event. Helpful for example, when you want to use
 * form element, but want to disable submit.
 *
 * @author Jakub Liput
 * @copyright (C) 2023-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

const handler = (event) => {
  event.preventDefault();
};

/**
 * @param {Event} event
 * @returns {(event: Event) => void}
 */
export function preventDefault() {
  return handler;
}

export default helper(preventDefault);
