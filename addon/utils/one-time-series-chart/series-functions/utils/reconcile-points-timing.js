// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable max-len */

/**
 * Alters points arrays so that all have the same timestamps (time domain).
 * All arrays will be aligned to the array with the newest set of points -
 * it means that some arrays will have some points removed and fake ones added
 * to transform them into target time domain.
 *
 * NOTE: this function modifies arrays in place!
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Point from 'onedata-gui-common/utils/one-time-series-chart/point';

/**
 * @param {Array<Array<Utils.OneTimeSeriesChart.Point>>} pointsArrays
 * @returns {Array<Array<Utils.OneTimeSeriesChart.Point>>}
 */
export default function reconcilePointsTiming(pointsArrays) {
  if (!pointsArrays.length) {
    return [];
  }

  let arrayWithNewestPoints = pointsArrays[0];
  let pointDuration = arrayWithNewestPoints[0]?.pointDuration;
  for (let i = 1; i < pointsArrays.length; i++) {
    if (pointsArrays[i].length) {
      if (
        !arrayWithNewestPoints.length ||
        arrayWithNewestPoints[0].timestamp < pointsArrays[i][0].timestamp
      ) {
        arrayWithNewestPoints = pointsArrays[i];
      }
      if (!pointDuration) {
        pointDuration = pointsArrays[i][0].pointDuration;
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
        pointDuration,
        oldest: true,
        newest: true,
        fake: true,
      };
    for (let i = pointsArray.length; i < arrayWithNewestPoints.length; i++) {
      pointsArray[i] = new Point(arrayWithNewestPoints[i].timestamp, null, {
        pointDuration,
        oldest: lastMeaningfulPoint.oldest && lastMeaningfulPoint.fake,
        newest: lastMeaningfulPoint.newest,
        fake: true,
      });
    }
  }
  return pointsArrays;
}
