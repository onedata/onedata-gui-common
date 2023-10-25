/**
 * Provides functions for fetching workflow execution stats. Needs to be extended
 * with real implementation.
 *
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
 * @property {Object<AtmLaneRunNumber,AtmLaneRunExecutionState>} runsRegistry
 */

/**
 * @typedef {Object} AtmLaneRunExecutionState
 * @property {AtmLaneRunNumber} runNumber
 * @property {Number|null} originRunNumber
 * @property {String} status
 * @property {Boolean} isRetriable
 * @property {Boolean} isRerunable
 */

/**
 * @typedef {Object<String,AtmParallelBoxExecutionState>} AtmParallelBoxesExecutionState
 * keys are parallel box schema ids
 */

/**
 * @typedef {Object} AtmParallelBoxExecutionState
 * @property {Object<AtmLaneRunNumber,AtmParallelBoxRunExecutionState>} runsRegistry
 */

/**
 * @typedef {Object} AtmParallelBoxRunExecutionState
 * @property {AtmLaneRunNumber} runNumber
 * @property {String} status
 */

/**
 * @typedef {Object<String,AtmTaskExecutionState>} AtmTasksExecutionState
 * keys are task schema ids
 */

/**
 * @typedef {Object} AtmTaskExecutionState
 * @property {Object<AtmLaneRunNumber,AtmTaskRunExecutionState>} runsRegistry
 */

/**
 * @typedef {Object} AtmTaskRunExecutionState
 * @property {AtmLaneRunNumber} runNumber
 * @property {String} instanceId
 * @property {String} systemAuditLogStoreInstanceId
 * @property {String} timeSeriesStoreInstanceId
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

export default EmberObject.extend({
  /**
   * @returns {Promise<AtmExecutionState>}
   */
  async fetchExecutionState() {
    return notImplementedReject();
  },

  /**
   * @param {String} storeInstanceId
   * @param {AtmStoreContentBrowseOptions} browseOptions
   * @returns {Promise<AtmStoreContentBrowseResult|null>}
   */
  async fetchStoreContent() {
    return notImplementedReject();
  },

  /**
   * @param {String} storeInstanceId
   * @param {Array<string>} traceIds
   * @returns {Promise<Object<string, string>>} map traceId -> index
   */
  async convertAtmExceptionStoreTraceIdsToIndices() {
    return notImplementedReject();
  },

  /**
   * @returns {AtmValuePresenterContext|undefined}
   */
  getStoreContentPresenterContext() {
    return undefined;
  },

  /**
   * @param {string} storeInstanceId
   * @returns {Promise<string>} download url
   */
  getAuditLogDownloadUrl() {
    return notImplementedReject();
  },
});
