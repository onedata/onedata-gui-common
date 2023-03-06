/**
 * Invoke the passed action if the invoking event is caused by the Enter key,
 * eg. onkeydown event.
 *
 * See examples in tests.
 *
 * @module helpers/invoke-on-enter
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';
import { invokeOnKey } from 'onedata-gui-common/helpers/invoke-on-key';

export function invokeOnEnter([action]) {
  return invokeOnKey([{ Enter: action }]);
}

export default helper(invokeOnEnter);
