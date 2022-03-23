/**
 * Contains data related to "time series" automation stores.
 *
 * @module utils/atm-workflow/store/time-series
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export const nameGeneratorTypes = [
  'exact',
  'addPrefix',
];

export const metricResolutions = [{
  name: 'fiveSeconds',
  resolution: 5,
}, {
  name: 'minute',
  resolution: 60,
}, {
  name: 'hour',
  resolution: 60 * 60,
}, {
  name: 'day',
  resolution: 24 * 60 * 60,
}, {
  name: 'week',
  resolution: 7 * 24 * 60 * 60,
}, {
  name: 'month',
  resolution: 30 * 24 * 60 * 60,
}, {
  name: 'year',
  resolution: 365 * 24 * 60 * 60,
}, {
  name: 'infinity',
  resolution: 0,
}];

export const metricAggregators = [
  'sum',
  'max',
  'min',
  'first',
  'last',
];
