/**
 * Helps generating selector for current component
 *
 * @module helpers/local-selector
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

export function localSelector([elementId, origSelector]) {
  let selector = `#${elementId}`;
  if (origSelector) {
    selector += ` ${origSelector}`;
  }
  return selector;
}

export default helper(localSelector);
