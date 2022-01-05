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
