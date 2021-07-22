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
   * @virtual
   * @type {Array<Object>}
   */
  stores: reads('visualiserComponent.stores'),

  /**
   * @param {String} storeSchemaId
   * @param {String} startFromIndex
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<{array: Array<StoreContentEntry>, isLast: Boolean}>}
   */
  getStoreContent( /* storeSchemaId, startFromIndex, limit, offset */ ) {
    const executionDataFetcher = this.get('visualiserComponent.executionDataFetcher');
    if (!executionDataFetcher) {
      return reject();
    }
    return executionDataFetcher.fetchStoreContent(...arguments);
  },

  /**
   * @param {Utils.WorkflowVisualiser.Lane.Task} task
   * @param {String} startFromIndex
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<{array: Array<StoreContentEntry>, isLast: Boolean}>}
   */
  getTaskAuditLogStoreContent(task, ...args) {
    const executionDataFetcher = this.get('visualiserComponent.executionDataFetcher');
    if (!executionDataFetcher) {
      return reject();
    }
    return executionDataFetcher.fetchTaskAuditLogContent(get(task, 'id'), ...args);
  },
});
