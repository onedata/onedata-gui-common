// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable jsdoc/require-returns */

/**
 * Creates a single point object.
 *
 * @module utils/one-time-series-chart/series-functions/utils/point
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { timeSeriesMetricResolutionsMap } from 'onedata-gui-common/utils/time-series';

/**
 * For more info about arguments see `OTSCSeriesPoint` type.
 * @param {number} timestamp
 * @param {number|null} [value]
 * @param {Partial<Omit<OTSCSeriesPoint, 'timestamp' | 'value'>>} [params]
 * @returns {OTSCSeriesPoint}
 */
export default function point(timestamp, value = null, params = {}) {
  const newPoint = Object.assign({
    timestamp,
    value,
    // Using 5s as a fallback value. 5s is the smallest possible time resolution
    // in time series.
    pointDuration: timeSeriesMetricResolutionsMap.fiveSeconds,
    firstMeasurementTimestamp: null,
    lastMeasurementTimestamp: null,
    oldest: false,
    newest: false,
    fake: false,
  }, params);

  recalculatePointMeasurementDuration(newPoint);

  return newPoint;
}

/**
 * @param {OTSCSeriesPoint} point
 */
export function recalculatePointMeasurementDuration(point) {
  const firstMeasurementTimestamp = point.firstMeasurementTimestamp ?? point.timestamp;
  const lastMeasurementTimestamp = point.lastMeasurementTimestamp ??
    (point.timestamp + point.pointDuration - 1);

  let measurementDuration;
  if (!point.oldest && !point.newest) {
    // All points in the middle of chart
    measurementDuration = point.pointDuration;
  } else if (point.fake && (point.oldest || point.newest)) {
    // Fake points at oldest or newest edge
    measurementDuration = 1;
  } else if (point.oldest && !point.newest) {
    // Real points at oldest edge only
    measurementDuration =
      point.timestamp + point.pointDuration - firstMeasurementTimestamp;
  } else if (!point.oldest && point.newest) {
    // Real points at newest edge only
    measurementDuration = lastMeasurementTimestamp - point.timestamp + 1;
  } else if (point.oldest && point.newest) {
    // Real points at both oldest and newest edge
    measurementDuration = lastMeasurementTimestamp - firstMeasurementTimestamp + 1;
  } else {
    // This should newer happen. Left for safety.
    measurementDuration = 1;
  }

  point.measurementDuration = Math.max(measurementDuration, 1);
}
