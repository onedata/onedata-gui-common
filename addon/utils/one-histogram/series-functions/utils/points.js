/**
 * @param {unknown} point
 * @returns {boolean}
 */
export function isHistogramPoint(point) {
  return Boolean(point) &&
    typeof point === 'object' &&
    'timestamp' in point &&
    'value' in point;
}

/**
 * @param {unknown} pointsArray
 * @returns {boolean}
 */
export function isHistogramPointsArray(pointsArray) {
  return Array.isArray(pointsArray) &&
    pointsArray.length > 0 &&
    pointsArray.every(elem => isHistogramPoint(elem));
}

/**
 * @param {Array<Array<OneHistogramSeriesPoint>>} pointsArrays
 * @returns {Array<Array<OneHistogramSeriesPoint>>}
 */
export function reconcileTiming(pointsArrays) {
  if (!pointsArrays.length) {
    return [];
  } else if (!pointsArrays[0].length) {
    return pointsArrays;
  }
  let arrayWithNewestPoints = pointsArrays[0];
  for (let i = 1; i < pointsArrays.length; i++) {
    if (pointsArrays[i][0].timestamp > arrayWithNewestPoints[0].timestamp) {
      arrayWithNewestPoints = pointsArrays[i];
    }
  }
  const firstTimestamp = arrayWithNewestPoints[0].timestamp;
  for (const pointsArray of pointsArrays) {
    if (pointsArray === arrayWithNewestPoints) {
      continue;
    }

    const indexOfFirstTimestamp = pointsArray.findIndex(({ timestamp }) => timestamp === firstTimestamp);
    const pointsToRemoveCount = indexOfFirstTimestamp >= 0 ?
      indexOfFirstTimestamp : pointsArray.length;
    pointsArray.splice(0, pointsToRemoveCount);

    for (let i = pointsArray.length; i < arrayWithNewestPoints.length; i++) {
      pointsArray[i] = {
        timestamp: arrayWithNewestPoints[i].timestamp,
        value: null,
      };
    }
  }
  return pointsArrays;
}
