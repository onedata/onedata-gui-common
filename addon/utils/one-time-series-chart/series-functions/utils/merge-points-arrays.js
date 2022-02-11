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
      mergedPointsArray[i].oldest =
        mergedPointsArray[i].oldest && pointsArray[i].oldest;
      mergedPointsArray[i].newest =
        mergedPointsArray[i].newest && pointsArray[i].newest;
      mergedPointsArray[i].fake =
        mergedPointsArray[i].fake && pointsArray[i].fake;
    }
  }
  return mergedPointsArray;
}
