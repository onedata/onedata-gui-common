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
 * @typedef {ViewStateChange} SelectElementActionContext
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartDashboardEditor.ViewStateChange) => void} changeViewState
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
   * @type {ComputedProperty<SelectElementActionContext['isChartEditorActive']>}
   */
  isChartEditorActive: reads('context.isChartEditorActive'),

  /**
   * @type {ComputedProperty<SelectElementActionContext['elementsToDeselect']>}
   */
  elementsToDeselect: reads('context.elementsToDeselect'),

  /**
   * @type {ComputedProperty<SelectElementActionContext['changeViewState']>}
   */
  changeViewState: reads('context.changeViewState'),

  /**
   * @override
   */
  onExecute() {
    this.changeViewState({
      elementToSelect: this.elementToSelect,
      isChartEditorActive: this.isChartEditorActive,
      elementsToDeselect: this.elementsToDeselect,
    });
  },
});
