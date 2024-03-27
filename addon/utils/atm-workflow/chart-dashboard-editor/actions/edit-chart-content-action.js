/**
 * Triggers chart content editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { reads } from '@ember/object/computed';

/**
 * @typedef {Object} EditChartContentActionContext
 * @property {Utils.AtmWorkflow.ChartDashboardEditor.Chart} chart
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartDashboardEditor.ViewStateChange) => void} changeViewState
 */

export default Action.extend({
  /**
   * @override
   */
  undoPossibility: ActionUndoPossibility.NotApplicable,

  /**
   * @virtual
   * @type {EditChartContentActionContext}
   */
  context: undefined,

  /**
   * @private
   * @type {ComputedProperty<EditChartContentActionContext['chart']>}
   */
  chart: reads('context.chart'),

  /**
   * @type {ComputedProperty<EditChartContentActionContext['changeViewState']>}
   */
  changeViewState: reads('context.changeViewState'),

  /**
   * @override
   */
  onExecute() {
    this.changeViewState({
      elementToSelect: this.chart,
      isChartEditorActive: true,
    });
  },
});
