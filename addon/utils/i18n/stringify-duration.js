/**
 * Converts duration (in seconds) to human readable format. Sign of the number matters -
 * negative number means duration in the past ('2 hours ago'), positive in the future
 * ('in 2 hours'). Short format of negative and positive duration is the same.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import moment from 'moment';

const humanizeShortI18n = {
  s: 'a few sec',
  ss: '%d sec',
  m: '1 min',
  mm: '%d mins',
  h: '1 hr',
  hh: '%d hrs',
  d: '1 day',
  dd: '%d days',
  M: '1 mo',
  MM: '%d mos',
  y: '1 year',
  yy: '%d years',
};

export default function stringifyDuration(seconds, {
  shortFormat = false,
  showIndividualSeconds = false,
  includeDaysCounter = false,
} = {}) {
  let oldSsThreshold = null;
  let oldRelativeTimeI18n = null;
  let durationString = '';
  let momentDuration;
  try {
    if (showIndividualSeconds) {
      oldSsThreshold = moment.relativeTimeThreshold('ss');
      moment.relativeTimeThreshold('ss', -1);
    }

    if (shortFormat) {
      oldRelativeTimeI18n = moment.localeData()._relativeTime;
      moment.updateLocale('en', { relativeTime: humanizeShortI18n });
    }

    momentDuration = moment.duration(seconds, 'seconds');
    durationString = momentDuration.humanize(!shortFormat);
  } finally {
    try {
      if (showIndividualSeconds && oldSsThreshold !== null) {
        moment.relativeTimeThreshold('ss', oldSsThreshold);
      }
      if (shortFormat && oldRelativeTimeI18n !== null) {
        moment.updateLocale('en', { relativeTime: oldRelativeTimeI18n });
      }
    } catch (e) {
      console.error(e);
    }
  }

  const bigEnoughForDaysCounter = durationString.includes('year') ||
    (shortFormat ? durationString.includes('mo') : durationString.includes('month'));

  if (momentDuration && includeDaysCounter && bigEnoughForDaysCounter) {
    const daysCount = Math.floor(Math.abs(momentDuration.asDays()));
    durationString += ` (${daysCount} days)`;
  }

  return durationString;
}
