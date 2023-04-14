/**
 * Just preventDefault action of event. Helpful for example, when you want to use
 * form element, but want to disable submit.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

/**
 * @param {Event} event
 * @returns {void}
 */
export function preventDefault() {
  return (event) => {
    event.preventDefault();
  };
}

export default helper(preventDefault);
