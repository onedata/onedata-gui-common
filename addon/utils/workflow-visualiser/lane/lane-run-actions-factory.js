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
  createActionsForRunNo(runNo) {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');
    if (!actionsFactory || !lane) {
      return [];
    }

    return [
      this.createViewFailedItemsAction(runNo),
    ].compact();
  },

  /**
   * @private
   * @param {Number} runNo
   * @returns {Utils.Action}
   */
  createViewFailedItemsAction(runNo) {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');
    return actionsFactory.createViewLaneFailedItemsAction({ lane, runNo });
  },
});
