/**
 * Prevents default action of enter key when a keypress event occurs
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

export function ignoreEnter() {
  return (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };
}

export default helper(ignoreEnter);
