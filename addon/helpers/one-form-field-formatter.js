/**
 * Uses one of predefined formatter helper to render value
 *
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';
import { dateFormat } from './date-format';

export function oneFormFieldFormatter([value, format] /*, hash*/ ) {
  if (format === 'date') {
    return dateFormat([value], { format: 'cert' });
  } else {
    return value;
  }
}

export default helper(oneFormFieldFormatter);
