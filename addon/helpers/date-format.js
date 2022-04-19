// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

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
export const reportFormatter = 'D MMM YYYY H:mm:ss';
export const detailedReportFormatter = 'D MMM YYYY H:mm:ss.SSS';
export const dateWithMinutesFormatter = 'D MMM YYYY H:mm';
export const detailedTimeFormatter = 'H:mm:ss.SSS';

const blanks = {
  cert: 'never',
};

const formatters = {
  default: certFormatter,
  cert: certFormatter,
  report: reportFormatter,
  detailedReport: detailedReportFormatter,
  dateWithMinutes: dateWithMinutesFormatter,
  detailedTime: detailedTimeFormatter,
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
    } else if (typeof inputDate === 'number') {
      dateMoment = moment.unix(inputDate);
    } else {
      dateMoment = moment(inputDate);
      if (!dateMoment.isValid()) {
        return blank;
      }
    }
    if (timezone) {
      dateMoment = dateMoment.utcOffset(timezone);
    }
    const formatter = formatters[format] || formatters['default'];
    return dateMoment.format(formatter);
  } else {
    return blank;
  }
}

export default helper(dateFormat);
