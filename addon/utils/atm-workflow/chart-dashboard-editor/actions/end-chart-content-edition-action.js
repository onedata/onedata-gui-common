/**
 * Triggers chart content editor close.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { reads } from '@ember/object/computed';

/**
 * @typedef {Object} EndChartContentEditionActionContext
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartDashboardEditor.ViewStateChange) => void} changeViewState
 */

export default Action.extend({
  /**
   * @override
   */
  undoPossibility: ActionUndoPossibility.NotApplicable,

  /**
   * @virtual
   * @type {EndChartContentEditionActionContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<EditChartContentActionContext['changeViewState']>}
   */
  changeViewState: reads('context.changeViewState'),

  /**
   * @override
   */
  onExecute() {
    this.changeViewState({
      isChartEditorActive: false,
    });
  },
});
