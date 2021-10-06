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
 * @typedef {Object} AtmExecutionState
 * @property {AtmWorkflowExecutionState} workflow
 * @property {AtmLanesExecutionState} lane
 * @property {AtmParallelBoxesExecutionState} parallelBox
 * @property {AtmTasksExecutionState} tasks
 * @property {AtmStoresExecutionState} store
 */

/**
 * @typedef {Object} AtmWorkflowExecutionState
 * @property {String} instanceId
 * @property {String} systemAuditLogStoreInstanceId
 * @property {String} status
 */

/**
 * @typedef {Object<String,AtmLaneExecutionState>} AtmLanesExecutionState
 * keys are lane schema ids
 */

/**
 * @typedef {Object} AtmLaneExecutionState
 * @property {Object<Number,AtmLaneRunExecutionState>} runsRegistry keys are
 * run numbers
 */

/**
 * @typedef {Object} AtmLaneRunExecutionState
 * @property {Number|null} runNo
 * @property {Number|null} sourceRunNo
 * @property {String} systemAuditLogStoreInstanceId
 * @property {String} status
 */

/**
 * @typedef {Object<String,AtmParallelBoxExecutionState>} AtmParallelBoxesExecutionState
 * keys are parallel box schema ids
 */

/**
 * @typedef {Object} AtmParallelBoxExecutionState
 * @property {Object<Number,AtmParallelBoxRunExecutionState>} runsRegistry keys are
 * run numbers
 */

/**
 * @typedef {Object} AtmParallelBoxRunExecutionState
 * @property {Number} runNo
 * @property {String} status
 */

/**
 * @typedef {Object<String,AtmTaskExecutionState>} AtmTasksExecutionState
 * keys are task schema ids
 */

/**
 * @typedef {Object} AtmTaskExecutionState
 * @property {Object<Number,AtmTaskRunExecutionState>} runsRegistry keys are
 * run numbers
 */

/**
 * @typedef {Object} AtmTaskRunExecutionState
 * @property {Number} runNo
 * @property {String} instanceId
 * @property {String} systemAuditLogStoreInstanceId
 * @property {String} status
 * @property {Number} itemsInProcessing
 * @property {Number} itemsProcessed
 * @property {Number} itemsFailed
 */

/**
 * @typedef {Object} AtmStoresExecutionState
 * @property {AtmDefinedStoresExecutionState} defined
 * @property {AtmGeneratedStoresExecutionState} generated
 */

/**
 * @typedef {Object<String,AtmDefinedStoreExecutionState>} AtmDefinedStoresExecutionState
 * keys are store schema ids
 */

/**
 * @typedef {Object} AtmDefinedStoreExecutionState
 * @property {String} instanceId
 */

/**
 * @typedef {Object<String,AtmGeneratedStoreExecutionState>} AtmGeneratedStoresExecutionState
 * keys are store instance ids
 */

/**
 * @typedef {Object} AtmGeneratedStoreExecutionState
 * @property {String} instanceId
 * @property {String} name
 * @property {String} type
 * @property {Object} dataSpec
 */

/**
 * @typedef {Object} StoreContentEntry
 * @property {String} index
 * @property {Boolean} success
 * @property {any} [value] present when `success` is true
 * @property {any} [error] present when `success` is false
 */

export default EmberObject.extend({
  /**
   * @returns {Promise<AtmExecutionState>}
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
