/**
 * Finds a minimum rectangle to contain all given points in a map and then returns
 * map settings accurate for found rectangle.
 *
 * @module utils/map-position-for-coordinates
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 * 
 * @function
 * @param {Array<{ latitude: number, longitude: number }>} points
 * @param {number} [paddingFactor=2] result rectangle will be enlarged by this factor
 * @returns {{ scale: number, latitude: number, longitude: number }}
 */
export default function mapPositionForCoordinates(points, paddingFactor = 2) {
  if (points.length > 0) {
    const latitudes = points.mapBy('latitude');
    const longitudes = points.mapBy('longitude');
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const areaWidth = (maxLng - minLng) * paddingFactor;
    const areaHeight = (maxLat - minLat) * paddingFactor;
    const xScale = 360 / areaWidth;
    const yScale = 180 / areaHeight;
    const scale = Math.max(1, Math.min(xScale, yScale));
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      scale,
    };
  } else {
    return {
      scale: 1,
      latitude: 0,
      longitude: 0,
    };
  }
}
