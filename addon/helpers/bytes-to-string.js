/**
 * A helper to use bytes-to-string util.
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';
import _ from 'lodash';
import bytesToStringUtil from 'onedata-gui-common/utils/bytes-to-string';

export function bytesToString([bytes], options) {
  return bytesToStringUtil(bytes, _.assign({ iecFormat: true }, options));
}

export default helper(bytesToString);
