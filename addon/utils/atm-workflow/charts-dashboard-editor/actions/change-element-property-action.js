/**
 * Changes property value of an element.
 *
 * When change type is `'continuous'`, then an instance of this actions is intended
 * to be used (executed) multiple times. When executed again and again it will
 * preserve previous value from the first execution. Undoing this action
 * will reassign that first value back (so one undo will revert all executions).
 * This approach allows to simulate undo/redo for text inputs in a way similar
 * to text editors (like undoing launches disappearing phrase-by-phrase instead
 * by letter-by-letter). To be fully functional, it should be connected with
 * additional logic maintaining timeouts and different types of inputs
 * (addition / deletion) - every N seconds and every input type change there
 * should be a separate change action generated to provide step-by-step edition
 * effect in actions history.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { set } from '@ember/object';
import { reads } from '@ember/object/computed';

/**
 * @typedef {Object} ChangeElementPropertyActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section} element
 * @property {string} propertyName
 * @property {unknown} newValue
 * @property {PropertyChangeType} changeType
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartsDashboardEditor.ViewStateChange) => void} changeViewState
 */

/**
 * @typedef {'discrete' | 'continuous'} PropertyChangeType
 * `'discrete'` means, that change is made to a property with a finite set
 * of allowed values and no possibility to have some "intermediate", invalid
 * values. Examples: toggle change, dropdown selection.
 * 'continuous' means, that change is made to a property, which value is built
 * incrementally by a sequence of events that may take some time. Examples:
 * text inputs, textareas.
 */

export default Action.extend({
  /**
   * @override
   */
  undoPossibility: ActionUndoPossibility.Possible,

  /**
   * @virtual
   * @type {ChangeElementPropertyActionContext}
   */
  context: undefined,

  /**
   * @private
   * @type {ComputedProperty<ChangeElementPropertyActionContext['element']>}
   */
  element: reads('context.element'),

  /**
   * @private
   * @type {ComputedProperty<ChangeElementPropertyActionContext['propertyName']>}
   */
  propertyName: reads('context.propertyName'),

  /**
   * @private
   * @type {ComputedProperty<ChangeElementPropertyActionContext['newValue']>}
   */
  newValue: reads('context.newValue'),

  /**
   * @private
   * @type {ComputedProperty<ChangeElementPropertyActionContext['changeType']>}
   */
  changeType: reads('context.changeType'),

  /**
   * @type {ComputedProperty<ChangeElementPropertyActionContext['changeViewState']>}
   */
  changeViewState: reads('context.changeViewState'),

  /**
   * @public
   * @type {unknown}
   */
  previousValue: undefined,

  /**
   * @private
   * @type {boolean}
   */
  wasExecuted: false,

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
    this.changeViewState({ elementToSelect: this.element });
    if (!this.wasExecuted) {
      this.set('previousValue', this.element[this.propertyName]);
    }
    this.set('wasExecuted', true);
    set(this.element, this.propertyName, this.newValue);
  },

  /**
   * @override
   */
  onExecuteUndo() {
    this.changeViewState({ elementToSelect: this.element });
    set(this.element, this.propertyName, this.previousValue);
  },
});
