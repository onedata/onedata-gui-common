/**
 * Clusterizes providers according to theirs coordinates. It divides map into
 * squares latitudeDelta x longitudeDelta and groups providers that are in
 * the same square. Returns array of objects in format:
 * `
 * {
 *   latitude {number}
 *   longitude {number}
 *   providers {Array<object>}
 * }
 * `
 * where latitude and longitude are coordinates of the center of the analyzed
 * square or, if there is only one provider in the square, coordinates of that
 * provider.
 *
 * @module utils/clusterize-providers-by-coordinates
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 * 
 * @function
 * @param {Array<object>} providers
 * @param {number} latitudeDelta
 * @param {number} longitudeDelta
 * @returns {Array<object>}
 */

import { getProperties, get } from '@ember/object';
import _ from 'lodash';

export default function clusterizeProvidersByCoordinates(
  providers,
  latitudeDelta = 5,
  longitudeDelta = 5
) {
  const usedSquares = [];
  providers.forEach(provider => {
    const {
      latitude,
      longitude,
    } = getProperties(provider, 'latitude', 'longitude');
    const squareLatitude = Math.min(
      Math.floor(latitude / latitudeDelta) * latitudeDelta,
      90 - latitudeDelta
    );
    const squareLongitude = Math.min(
      Math.floor(longitude / longitudeDelta) * longitudeDelta,
      180 - longitudeDelta
    );
    let square = _.find(
      usedSquares, { latitude: squareLatitude, longitude: squareLongitude }
    );
    if (!square) {
      square = {
        latitude: squareLatitude,
        longitude: squareLongitude,
        providers: [],
      };
      usedSquares.push(square);
    }
    square.providers.push(provider);
  });
  usedSquares.forEach(square => {
    if (square.providers.length === 1) {
      square.latitude = get(square.providers[0], 'latitude')
      square.longitude = get(square.providers[0], 'longitude')
    } else {
      square.latitude += latitudeDelta / 2;
      square.longitude += longitudeDelta / 2;
    }
  });
  return usedSquares;
}
