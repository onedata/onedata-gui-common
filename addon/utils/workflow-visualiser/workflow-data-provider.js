/**
 * Includes properties and methods, which allows to obtain workflow-related data.
 * Created by workflow-visualiser and used internally by actions-factory to
 * provide necessary data to the actions.
 *
 * @module utils/workflow-visualiser/workflow-data-provider
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { reject } from 'rsvp';

export default EmberObject.extend({
  /**
   * @type {Components.WorkflowVisualiser}
   */
  visualiserComponent: undefined,

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Workflow>}
   */
  workflow: reads('visualiserComponent.workflow'),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  stores: reads('visualiserComponent.stores'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.ExecutionDataFetcher>}
   */
  executionDataFetcher: reads('visualiserComponent.executionDataFetcher'),

  /**
   * @param {Utils.WorkflowVisualiser.Store} store
   * @param {String} startFromIndex
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<{array: Array<StoreContentEntry>, isLast: Boolean}>}
   */
  getStoreContent(store, ...args) {
    const executionDataFetcher = this.get('executionDataFetcher');
    if (!executionDataFetcher) {
      console.error(
        'util:workflow-visualiser/workflow-data-provider#getStoreContent: executionDataFetcher is not set',
      );
      return reject();
    }
    return executionDataFetcher.fetchStoreContent(get(store, 'id'), ...args);
  },

  /**
   * @param {String} startFromIndex
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<{array: Array<StoreContentEntry>, isLast: Boolean}>}
   */
  getWorkflowAuditLogContent(...args) {
    const executionDataFetcher = this.get('executionDataFetcher');
    if (!executionDataFetcher) {
      console.error(
        'util:workflow-visualiser/workflow-data-provider#getWorkflowAuditLogContent: executionDataFetcher is not set',
      );
      return reject();
    }
    return executionDataFetcher.fetchWorkflowAuditLogContent(...args);
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane.Task} task
   * @param {String} startFromIndex
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<{array: Array<StoreContentEntry>, isLast: Boolean}>}
   */
  getTaskAuditLogContent(task, ...args) {
    const executionDataFetcher = this.get('executionDataFetcher');
    if (!executionDataFetcher) {
      console.error(
        'util:workflow-visualiser/workflow-data-provider#getTaskAuditLogContent: executionDataFetcher is not set',
      );
      return reject();
    }
    return executionDataFetcher.fetchTaskAuditLogContent(get(task, 'id'), ...args);
  },
});
