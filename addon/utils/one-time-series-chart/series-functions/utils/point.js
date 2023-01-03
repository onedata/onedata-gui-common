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
 * @param {{ pointDuration?: TimeSeriesMetricResolution, firstMeasurementTimestamp?: number|null, lastMeasurementTimestamp?: number|null, measurementDuration?: number, oldest?: boolean, newest?: boolean, fake?: boolean}} [params]
 * @returns {OTSCSeriesPoint}
 */
export default function point(timestamp, value = null, params = {}) {
  const newPoint = Object.assign({
    timestamp,
    value,
    pointDuration: timeSeriesMetricResolutionsMap.fiveSeconds,
    firstMeasurementTimestamp: null,
    lastMeasurementTimestamp: null,
    measurementDuration: 1,
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
  if (!point.oldest && !point.newest) {
    // All points in the middle of chart
    point.measurementDuration = point.pointDuration;
  } else if (point.fake && (point.oldest || point.newest)) {
    // Fake points at oldest or newest edge
    point.measurementDuration = 1;
  } else if (point.oldest && !point.newest) {
    // Real points at oldest edge only
    point.measurementDuration = Math.max(
      point.timestamp + point.pointDuration - firstMeasurementTimestamp,
      1
    );
  } else if (!point.oldest && point.newest) {
    // Real points at newest edge only
    point.measurementDuration = Math.max(
      lastMeasurementTimestamp - point.timestamp + 1,
      1
    );
  } else if (point.oldest && point.newest) {
    // Real points at both oldest and newest edge
    point.measurementDuration = Math.max(
      lastMeasurementTimestamp - firstMeasurementTimestamp + 1,
      1
    );
  } else {
    // This should newer happen. Left for safety.
    point.measurementDuration = 1;
  }
}
