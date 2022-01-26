/**
 * Creates a single point object.
 *
 * @module utils/one-histogram/series-functions/utils/point
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {number} timestamp
 * @param {number|null} [value]
 * @param {{ oldest?: boolean, newest?: boolean, fake?: boolean}} [params]
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
