/**
 * Alters points arrays so that all have the same timestamps (time domain).
 * All arrays will be aligned to the array with the newest set of points -
 * it means that some arrays will have some points removed and fake ones added
 * to transform them into target time domain.
 *
 * NOTE: this function modifies arrays in place!
 *
 * @module utils/one-time-series-chart/series-functions/utils/merge-points-arrays
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import point from './point';

/**
 * @param {Array<Array<OTSCSeriesPoint>>} pointsArrays
 * @returns {Array<Array<OTSCSeriesPoint>>}
 */
export default function reconcilePointsTiming(pointsArrays) {
  if (!pointsArrays.length) {
    return [];
  }

  let arrayWithNewestPoints = pointsArrays[0];
  for (let i = 1; i < pointsArrays.length; i++) {
    if (pointsArrays[i].length) {
      if (
        !arrayWithNewestPoints.length ||
        arrayWithNewestPoints[0].timestamp < pointsArrays[i][0].timestamp
      ) {
        arrayWithNewestPoints = pointsArrays[i];
      }
    }
  }
  if (!arrayWithNewestPoints.length) {
    return pointsArrays;
  }

  const firstTimestamp = arrayWithNewestPoints[0].timestamp;
  for (const pointsArray of pointsArrays) {
    if (pointsArray === arrayWithNewestPoints) {
      continue;
    }

    const indexOfFirstTimestamp = pointsArray.findIndex(({ timestamp }) => timestamp === firstTimestamp);
    const pointsToRemoveCount = indexOfFirstTimestamp >= 0 ?
      indexOfFirstTimestamp : pointsArray.length;
    const removedPoints = pointsArray.splice(0, pointsToRemoveCount);

    const lastMeaningfulPoint = pointsArray[pointsArray.length - 1] ||
      removedPoints[removedPoints.length - 1] || {
        oldest: true,
        newest: true,
        fake: true,
      };
    for (let i = pointsArray.length; i < arrayWithNewestPoints.length; i++) {
      pointsArray[i] = point(arrayWithNewestPoints[i].timestamp, null, {
        oldest: lastMeaningfulPoint.oldest && lastMeaningfulPoint.fake,
        newest: lastMeaningfulPoint.newest,
        fake: true,
      });
    }
  }
  return pointsArrays;
}
