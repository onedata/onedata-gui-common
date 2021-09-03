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
   *     workflow: {
   *       instanceId: 'workflowInstanceId',
   *       systemAuditLogStoreInstanceId: 'storeInstanceId1',
   *       status: 'latestRunWorkflowStatus',
   *     },
   *     lane: {
   *       lane1SchemaId: {
   *         runs: {
   *           1: {
   *             runNo: 1,
   *             sourceRunNo: null, // will be a number less than runNo
   *             iteratedStoreInstanceId: 'store1InstanceIdW1',
   *             status: 'run1LaneStatus',
   *           },
   *           2: { ... },
   *           ...
   *         },
   *       },
   *       lane2SchemaId: { ... },
   *       ...
   *     },
   *     parallelBox: {
   *       parallelBox1SchemaId: {
   *         runs: {
   *           1: {
   *             runNo: 1,
   *             status: 'run1PboxStatus',
   *           },
   *           2: { ... },
   *           ...
   *         },
   *       },
   *       parallelBox2SchemaId: { ... },
   *       ...
   *     },
   *     task: {
   *       task1SchemaId: {
   *         runs: {
   *           1: {
   *             runNo: 1,
   *             instanceId: 'task1InstanceId1',
   *             systemAuditLogStoreInstanceId: 'storeInstanceIdT1',
   *             statuse: 'run1TaskStatus',
   *             itemsInProcessing: 123,
   *             itemsProcessed: 123,
   *             itemsFailed: 123,,
   *           },
   *           2: { ... },
   *           ...
   *         },
   *       },
   *       task2SchemaId: { ... },
   *       ...
   *     },
   *     store: {
   *       defined: {
   *         store1SchemaId: {
   *           instanceId: 'store1InstanceId',
   *         },
   *         store2SchemaId: { ... },
   *         ...
   *       },
   *       generated: {
   *         store3InstanceId: {
   *           instanceId: 'store3InstanceId',
   *           type: 'storeType',
   *           dataSpec: {
   *             type: 'dataSpecType,
   *             valueConstraints: { ... },
   *           },
   *           defaultInitialValue: { ... },
   *         }
   *       }
   *     },
   *   }
   *   ```
   */
  async fetchExecutionState() {
    return notImplementedReject();
  },

  /**
   * @param {String} storeInstanceId
   * @param {String} startFromIndex
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<{array: Array<StoreContentEntry>, isLast: Boolean}>}
   */
  async fetchStoreContent() {
    return notImplementedReject();
  },
});
