/**
 * Merges many points arrays into a single one in a way, that properly preserves
 * information about oldest/newest/fake points' flags. As a second argument it
 * takes an array of values, which should be applied to the new points array
 * (as it is not obvious how to merge points values and it depends on a specific usage).
 *
 * @module utils/one-time-series-chart/series-functions/utils/merge-points-arrays
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { recalculatePointMeasurementDuration } from './point';

/**
 * @param {Array<Array<OTSCSeriesPoint>>} pointsArrays
 * @param {Array<number|null>} newPointsValues
 * @returns {Array<OTSCSeriesPoint>}
 */
export default function mergePointsArrays(pointsArrays, newPointsValues) {
  if (!pointsArrays.length) {
    return [];
  }
  const mergedPointsArray = pointsArrays[0].map((point, idx) =>
    Object.assign({}, point, { value: newPointsValues[idx] })
  );
  for (const pointsArray of pointsArrays.slice(1)) {
    for (let i = 0; i < mergedPointsArray.length; i++) {
      if (!pointsArray[i].fake) {
        if (
          pointsArray[i].firstMeasurementTimestamp !== null && (
            mergedPointsArray[i].fake ||
            mergedPointsArray[i].firstMeasurementTimestamp === null ||
            mergedPointsArray[i].firstMeasurementTimestamp >
            pointsArray[i].firstMeasurementTimestamp
          )
        ) {
          mergedPointsArray[i].firstMeasurementTimestamp =
            pointsArray[i].firstMeasurementTimestamp;
        }

        if (
          pointsArray[i].lastMeasurementTimestamp !== null && (
            mergedPointsArray[i].fake ||
            mergedPointsArray[i].lastMeasurementTimestamp === null ||
            mergedPointsArray[i].lastMeasurementTimestamp <
            pointsArray[i].lastMeasurementTimestamp
          )
        ) {
          mergedPointsArray[i].lastMeasurementTimestamp =
            pointsArray[i].lastMeasurementTimestamp;
        }
      }

      mergedPointsArray[i].oldest =
        mergedPointsArray[i].oldest && pointsArray[i].oldest;
      mergedPointsArray[i].newest =
        mergedPointsArray[i].newest && pointsArray[i].newest;
      mergedPointsArray[i].fake =
        mergedPointsArray[i].fake && pointsArray[i].fake;
    }
  }
  mergedPointsArray.forEach((point) =>
    recalculatePointMeasurementDuration(point)
  );
  return mergedPointsArray;
}
