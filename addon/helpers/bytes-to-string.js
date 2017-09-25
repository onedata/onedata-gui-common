/**
 * A helper to use bytes-to-string util.
 *
 * @module helpers/bytes-to-string
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import _ from 'lodash';
import bytesToStringUtil from 'onedata-gui-common/utils/bytes-to-string';

export function bytesToString([bytes], options) {
  return bytesToStringUtil(bytes, _.assign({ iecFormat: true }, options));
}

export default Ember.Helper.helper(bytesToString);
