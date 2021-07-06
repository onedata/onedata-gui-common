/**
 * Provides functions for fetching workflow execution stats. Needs to be extended
 * with real implementation.
 *
 * @module utils/workflow-visualiser/execution-data-fetcher
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

/**
 * @typedef {Object} StoreContentEntry
 * @property {String} index
 * @property {Boolean} success
 * @property {any} [value] present when `success` is true
 * @property {any} [error] present when `success` is false
 */

export default EmberObject.extend({
  /**
   * @returns {Promise<Object>} Object format:
   *   ```
   *   {
   *     global: {
   *       status: String,
   *     },
   *     lane: [..., {
   *       status: String,
   *     }, ...],
   *     parallelBox: [..., {
   *      status: String,
   *     }, ...],
   *     task: [..., {
   *      status: String,
   *      itemsInProcessing: Number,
   *      itemsProcessed: Number,
   *      itemsFailed: Number,
   *     }, ...],
   *   }
   *   ```
   */
  async fetchStatuses() {
    return notImplementedReject();
  },

  /**
   * @param {String} storeSchemaId
   * @param {String} startFromIndex
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<{array: Array<StoreContentEntry>, isLast: Boolean}>}
   */
  async fetchStoreContent() {
    return notImplementedReject();
  },
});
