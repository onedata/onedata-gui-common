/**
 * No-op function for templates
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export function noAction() {
  return notImplementedIgnore;
}

export default helper(noAction);
