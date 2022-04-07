// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable valid-jsdoc */

/**
 * Creates a single point object.
 *
 * @module utils/one-time-series-chart/series-functions/utils/point
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * For more info about arguments see `OTSCSeriesPoint` type.
 * @param {number} timestamp
 * @param {number|null} [value]
 * @param {{ oldest?: boolean, newest?: boolean, fake?: boolean}} [params]
 * @returns {OTSCSeriesPoint}
 */
export default function point(timestamp, value = null, params = {}) {
  return Object.assign({
    timestamp,
    value,
    oldest: false,
    newest: false,
    fake: false,
  }, params);
}
