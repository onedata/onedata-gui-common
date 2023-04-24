/**
 * Selects an element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { reads } from '@ember/object/computed';

/**
 * @typedef {Object} SelectElementActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement | null} elementToSelect
 *   `null` means that we want to deselect existing selection
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartsDashboardEditor.ViewStateChange) => void} changeViewState
 */

export default Action.extend({
  /**
   * @override
   */
  undoPossibility: ActionUndoPossibility.NotApplicable,

  /**
   * @virtual
   * @type {SelectElementActionContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<SelectElementActionContext['elementToSelect']>}
   */
  elementToSelect: reads('context.elementToSelect'),

  /**
   * @type {ComputedProperty<SelectElementActionContext['changeViewState']>}
   */
  changeViewState: reads('context.changeViewState'),

  /**
   * @override
   */
  willDestroy() {
    try {
      this.set('context', null);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onExecute() {
    this.changeViewState({ elementToSelect: this.elementToSelect });
  },
});
