/**
 * Provides functions for fetching workflow execution stats. Needs to be extended
 * with real implementation.
 *
 * @module utils/workflow-visualiser/stats-fetcher
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

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
});
