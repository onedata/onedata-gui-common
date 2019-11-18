/**
 * Replaces dots with dashes in given string.
 *
 * @module helpers/dot-to-dash
 * @author Michał Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';
import dotToDashUtil from 'onedata-gui-common/utils/dot-to-dash';

export function dotToDash([string] /*, hash*/ ) {
  return dotToDashUtil(string);
}

export default helper(dotToDash);
