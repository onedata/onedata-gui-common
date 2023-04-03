/**
 * Creates array of actions for specific lane run.
 *
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
   * @param {AtmLaneRunNumber} runNumber
   * @returns {Array<Util.Action>}
   */
  createActionsForRunNumber(runNumber) {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');
    if (!actionsFactory || !lane) {
      return [];
    }

    return [
      this.createViewFailedItemsAction(runNumber),
      this.createRetryAction(runNumber),
      this.createRerunAction(runNumber),
      this.createViewLaneChartsDashboardAction(runNumber),
    ];
  },

  /**
   * @private
   * @param {AtmLaneRunNumber} runNumber
   * @returns {Utils.Action}
   */
  createViewFailedItemsAction(runNumber) {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');
    return actionsFactory.createViewLaneFailedItemsAction({ lane, runNumber });
  },

  /**
   * @private
   * @param {AtmLaneRunNumber} runNumber
   * @returns {Utils.Action}
   */
  createViewLaneChartsDashboardAction(runNumber) {
    return this.actionsFactory.createViewLaneChartsDashboardAction({
      lane: this.lane,
      runNumber,
    });
  },

  /**
   * @private
   * @param {AtmLaneRunNumber} runNumber
   * @returns {Utils.Action}
   */
  createRetryAction(runNumber) {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');
    return actionsFactory.createRetryLaneAction({ lane, runNumber });
  },

  /**
   * @private
   * @param {AtmLaneRunNumber} runNumber
   * @returns {Utils.Action}
   */
  createRerunAction(runNumber) {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');
    return actionsFactory.createRerunLaneAction({ lane, runNumber });
  },
});
