/**
 * Represents the whole workflow.
 *
 * @module utils/workflow-visualiser/workflow
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * @type {String}
   */
  __modelType: 'workflow',

  /**
   * @virtual optional
   * @type {String}
   */
  instanceId: undefined,

  /**
   * @virtual optional
   * @type {Utils.WorkflowVisualiser.Store}
   */
  systemAuditLogStore: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  status: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Workflow} workflow
   * @param {Object} modifiedProps
   * @returns {Promise}
   */
  onModify: undefined,

  async modify(modifiedProps) {
    return this.onModify?.(this, modifiedProps);
  },
});
