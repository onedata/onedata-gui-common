/**
 * Adds new function to specific target.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { set, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { createNewFunction } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

/**
 * @typedef {Object} AddFunctionActionContext
 * @property {string} newFunctionName
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase} targetFunction
 * @property {string} targetArgumentName
 * @property {Array<ChartsDashboardEditorDataSource>} dataSources
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartsDashboardEditor.ViewStateChange) => void} changeViewState
 */

export default Action.extend({
  /**
   * @override
   */
  undoPossibility: ActionUndoPossibility.Possible,

  /**
   * @virtual
   * @type {AddFunctionActionContext}
   */
  context: undefined,

  /**
   * Becomes defined during action execution
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase | null}
   */
  newFunction: null,

  /**
   * @type {ComputedProperty<AddFunctionActionContext['newFunctionName']>}
   */
  newFunctionName: reads('context.newFunctionName'),

  /**
   * @type {ComputedProperty<AddFunctionActionContext['targetFunction']>}
   */
  targetFunction: reads('context.targetFunction'),

  /**
   * @type {ComputedProperty<AddFunctionActionContext['targetArgumentName']>}
   */
  targetArgumentName: reads('context.targetArgumentName'),

  /**
   * @type {ComputedProperty<AddFunctionActionContext['dataSources']>}
   */
  dataSources: reads('context.dataSources'),

  /**
   * @type {ComputedProperty<AddFunctionActionContext['changeViewState']>}
   */
  changeViewState: reads('context.changeViewState'),

  /**
   * @type {ComputedProperty<FunctionAttachableArgumentSpec | null>}
   */
  targetArgumentSpec: computed('targetFunction', 'targetArgumentName',
    function targetArgumentSpec() {
      return this.targetFunction.attachableArgumentSpecs.find(({ name }) =>
        name === this.targetArgumentName
      ) ?? null;
    }
  ),

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.newFunction && !this.newFunction.parent) {
        this.newFunction.destroy();
      }
      this.set('newFunction', null);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onExecute() {
    // Create new function
    if (!this.newFunction) {
      this.set('newFunction', this.createNewFunction());
      if (!this.newFunction) {
        return;
      }
    } else {
      [this.newFunction, ...this.newFunction.nestedElements()].forEach((element) =>
        set(element, 'isRemoved', false)
      );
    }

    // Assign parent
    set(this.newFunction, 'parent', this.targetFunction);

    // Add new function to the parent
    if (this.targetArgumentSpec.isArray) {
      set(this.targetFunction, this.targetArgumentName, [
        ...this.targetFunction[this.targetArgumentName],
        this.newFunction,
      ]);
    } else {
      set(this.targetFunction, this.targetArgumentName, this.newFunction);
    }

    this.changeViewState({ elementToSelect: this.newFunction });
  },

  /**
   * @override
   */
  onExecuteUndo() {
    if (!this.newFunction) {
      return;
    }

    // Add new function to the parent
    if (this.targetArgumentSpec.isArray) {
      set(
        this.targetFunction,
        this.targetArgumentName,
        this.targetFunction[this.targetArgumentName]
        .filter((func) => func !== this.newFunction)
      );
    } else {
      set(this.targetFunction, this.targetArgumentName, null);
    }

    set(
      this.targetElement,
      this.collectionName,
      this.targetElement[this.collectionName]
      .filter((element) => element !== this.newElement)
    );
    set(this.newFunction, 'parent', null);

    [this.newFunction, ...this.newFunction.nestedElements()].forEach((element) =>
      set(element, 'isRemoved', true)
    );

    this.changeViewState({
      elementsToDeselect: [this.newFunction, ...this.newFunction.nestedElements()],
    });
  },

  /**
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase | null}
   */
  createNewFunction() {
    return createNewFunction(
      this.newFunctionName,
      this.targetFunction.elementOwner,
      this.dataSources
    );
  },
});
