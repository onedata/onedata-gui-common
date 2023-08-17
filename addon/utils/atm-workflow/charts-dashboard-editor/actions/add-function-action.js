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
import { createNewFunction, ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

/**
 * @typedef {Object} AddFunctionActionContext
 * @property {string} newFunctionName
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase} targetFunction
 * @property {string} targetArgumentName
 * @property {number} [insertAtIndex]
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase | null} [functionToAttach]
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
   * Becomes defined during action execution
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase | null}
   */
  oldFunctionToAttachParent: null,

  /**
   * Becomes defined during action execution
   * @type {Array<DashboardElementReference>}
   */
  removedReferencesToAttachedFunction: null,

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
   * @type {ComputedProperty<AddFunctionActionContext['insertAtIndex']>}
   */
  insertAtIndex: reads('context.insertAtIndex'),

  /**
   * @type {ComputedProperty<AddFunctionActionContext['functionToAttach']>}
   */
  functionToAttach: reads('context.functionToAttach'),

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

    // Attach functionToAttach to the newly created function
    if (
      this.functionToAttach && (
        !this.functionToAttach.parent ||
        this.functionToAttach.parent.elementType === ElementType.Function
      ) && this.newFunction.attachableArgumentSpecs.length > 0
    ) {
      if (this.functionToAttach.parent) {
        this.setProperties({
          oldFunctionToAttachParent: this.functionToAttach.parent,
          removedReferencesToAttachedFunction: this.functionToAttach
            .parent.removeElementReferences(this.functionToAttach),
        });
      }
      set(this.functionToAttach, 'parent', this.newFunction);
      const firstArgSpec = this.newFunction.attachableArgumentSpecs[0];
      if (firstArgSpec.isArray) {
        set(this.newFunction, firstArgSpec.name, [this.functionToAttach]);
      } else {
        set(this.newFunction, firstArgSpec.name, this.functionToAttach);
      }
    }

    // Add new function to the parent
    if (this.targetArgumentSpec.isArray) {
      const insertAtIndex = this.insertAtIndex ??
        this.targetFunction[this.targetArgumentName].length;
      set(this.targetFunction, this.targetArgumentName, [
        ...this.targetFunction[this.targetArgumentName].slice(0, insertAtIndex),
        this.newFunction,
        ...this.targetFunction[this.targetArgumentName].slice(insertAtIndex),
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

    // Remove new function from the parent
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

    // Rollback functionToAttach attachment
    if (this.functionToAttach.parent === this.newFunction) {
      set(this.functionToAttach, 'parent', this.oldFunctionToAttachParent);
      this.removedReferencesToAttachedFunction?.forEach((removedReference) => {
        removedReference.referencingElement.rollbackReferenceRemoval(removedReference);
      });
      this.newFunction.removeElementReferences(this.functionToAttach);
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
