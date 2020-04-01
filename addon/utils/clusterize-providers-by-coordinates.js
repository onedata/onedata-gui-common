/**
 * Clusterizes providers according to theirs coordinates. For each provider:
 * * it searches for square latitudeDelta x longitudeDelta, where provider can be placed
 * * if square does not exist, create new square with latitude and longitude of the square center the same as provider coordinates
 * * add provider to the square
 * After all, each square coordinates are transformed to average coordinates of all providers in that square.
 * Returns array of objects in format:
 * `
 * {
 *   latitude {number}
 *   longitude {number}
 *   providers {Array<object>}
 * }
 * `
 *
 * @module utils/clusterize-providers-by-coordinates
 * @author Michal Borzecki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
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
  latitudeDelta = 10,
  longitudeDelta = 10
) {
  const usedSquares = [];
  providers.forEach(provider => {
    const {
      latitude,
      longitude,
    } = getProperties(provider, 'latitude', 'longitude');
    let square = _.find(
      usedSquares,
      ({ latitude: squareLatitude, longitude: squareLongitude }) =>
      latitude >= squareLatitude - latitudeDelta / 2 &&
      latitude < squareLatitude + latitudeDelta / 2 &&
      longitude >= squareLongitude - longitudeDelta / 2 &&
      longitude < squareLongitude + longitudeDelta / 2
    );
    if (!square) {
      square = {
        latitude,
        longitude,
        providers: [],
      };
      usedSquares.push(square);
    }
    square.providers.push(provider);
  });
  usedSquares.forEach(square => {
    square.latitude =
      _.sumBy(square.providers, provider => get(provider, 'latitude')) /
      square.providers.length;
    square.longitude =
      _.sumBy(square.providers, provider => get(provider, 'longitude')) /
      square.providers.length;
    square.id = square.providers.mapBy('id').sort().join('|');
  });
  return usedSquares;
}
