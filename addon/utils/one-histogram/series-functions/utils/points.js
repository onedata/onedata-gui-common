/**
 * @param {number} timestamp
 * @param {number|null} [value]
 * @param {{ oldest: boolean, newest: boolean, fake: boolean}} [params]
 */
export function point(timestamp, value = null, params = {}) {
  return Object.assign({ timestamp, value, oldest: false, newest: false, fake: false }, params);
}

/**
 * @param {Array<Array<OneHistogramSeriesPoint>>} pointsArrays
 * @returns {Array<Array<OneHistogramSeriesPoint>>}
 */
export function reconcileTiming(pointsArrays) {
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

/**
 * @param {Array<Array<OneHistogramSeriesPoint>>} pointsArrays
 * @param {Array<number|null>} newPointsValues
 * @returns {Array<OneHistogramSeriesPoint>}
 */
export function mergeHistogramPointsArrays(pointsArrays, newPointsValues) {
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
