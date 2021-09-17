/**
 * Creates array of actions for specific lane run.
 *
 * @module utils/workflow-visualiser/lane/lane-run-actions-factory
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.Lane}
   */
  lane: undefined,

  /**
   * @param {Number} runNo
   * @returns {Array<Util.Action>}
   */
  createActionsForRunNo( /* runNo */ ) {
    return [];
  },
});
