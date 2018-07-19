/**
 * Converts date in text or MomentJS to some predefined format
 *
 * @module helpers/date-format
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';
import moment from 'moment';

export const certFormatter = 'YYYY-MM-DD [at] H:mm ([UTC]Z)';

const blanks = {
  cert: 'never',
};

const formatters = {
  default: certFormatter,
  cert: certFormatter,
};

export function dateFormat([inputDate], { format, timezone, blank } = {}) {
  format = format || 'default';
  timezone = timezone || null;
  blank = blank || blanks[format] || '';
  if (inputDate) {
    /** @type {moment.Moment} */
    let dateMoment;
    if (typeof inputDate === 'object' && inputDate instanceof moment) {
      dateMoment = inputDate;
    } else {
      dateMoment = moment(inputDate);
      if (!dateMoment.isValid()) {
        return blank;
      }
    }
    if (timezone) {
      dateMoment = dateMoment.zone(timezone);
    }
    const formatter = formatters[format] || formatters['default'];
    return dateMoment.format(formatter);
  } else {
    return blank;
  }
}

export default helper(dateFormat);
