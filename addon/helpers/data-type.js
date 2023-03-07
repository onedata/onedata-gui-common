/**
 * Returns type of given data (`typeof` operator alias).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

export function dataType([data] /*, hash*/ ) {
  return typeof data;
}

export default helper(dataType);
