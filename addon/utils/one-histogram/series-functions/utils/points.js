export function isHistogramPoint(point) {
  return point && typeof point === 'object' && 'timestamp' in point && 'value' in point;
}

export function isHistogramPointsArray(pointsArray) {
  return Array.isArray(pointsArray) && pointsArray.every(elem => isHistogramPoint(elem));
}
