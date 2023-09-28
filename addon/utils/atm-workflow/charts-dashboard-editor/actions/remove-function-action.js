/**
 * Removes chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { ChangedElementsSet } from './utils';

/**
 * @typedef {Object} RemoveFunctionActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase} functionToRemove
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartsDashboardEditor.ViewStateChange) => void} changeViewState
 */

export default Action.extend({
  /**
   * @override
   */
  undoPossibility: ActionUndoPossibility.Possible,

  /**
   * @virtual
   * @type {RemoveElementActionContext}
   */
  context: undefined,

  /**
   * Becomes defined during action execution
   * @type {Array<DashboardElementReference> | null}
   */
  removedReferences: null,

  /**
   * @type {ComputedProperty<RemoveElementActionContext['functionToRemove']>}
   */
  functionToRemove: reads('context.functionToRemove'),

  /**
   * @type {ComputedProperty<RemoveElementActionContext['changeViewState']>}
   */
  changeViewState: reads('context.changeViewState'),

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.wasExecuted) {
        this.functionToRemove?.destroy();
      }
      if (this.removedReferences) {
        this.set('removedReferences', null);
      }
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onExecute() {
    const changedElements = new ChangedElementsSet();
    // It is important to first set `isRemoved` and detach nested elements
    // after that. When element detaches, then it tries to figure out why detach
    // ocurred by checking i.a. `isRemoved` flag of the parent. See more in
    // function-renderer component.
    set(this.functionToRemove, 'isRemoved', true);

    this.detachArgumentFunctions();
    for (const attachedFunc of this.functionToRemove.attachedFunctions()) {
      changedElements.addElement(attachedFunc);
      if (attachedFunc.parent) {
        changedElements.addElement(attachedFunc.parent);
      }
    }

    this.removeReferences();
    this.removedReferences?.forEach(({ referencingElement }) =>
      changedElements.addElement(referencingElement)
    );

    changedElements.notifyAboutChange();

    this.changeViewState({
      elementsToDeselect: [this.functionToRemove],
    });
  },

  /**
   * @override
   */
  onExecuteUndo() {
    const changedElements = new ChangedElementsSet();
    this.rollbackReferencesRemoval();
    this.removedReferences?.forEach(({ referencingElement }) =>
      changedElements.addElement(referencingElement)
    );

    this.reattachArgumentFunctions();
    for (const attachedFunc of this.functionToRemove.attachedFunctions()) {
      changedElements.addElement(attachedFunc);
      if (attachedFunc.parent) {
        changedElements.addElement(attachedFunc.parent);
      }
    }

    set(this.functionToRemove, 'isRemoved', false);
    changedElements.notifyAboutChange();
  },

  /**
   * Detaches all functions attached to the `functionToRemove` as an argument.
   * @private
   * @returns {void}
   */
  detachArgumentFunctions() {
    const attachedFunctions = [...this.functionToRemove.attachedFunctions()];
    if (!attachedFunctions.length) {
      return;
    }

    let closestParentWithDetachedFuncs;
    let possibleParentWithDetachedFuncs = this.functionToRemove.parent;
    while (!closestParentWithDetachedFuncs && possibleParentWithDetachedFuncs) {
      if (possibleParentWithDetachedFuncs.detachedFunctions) {
        closestParentWithDetachedFuncs = possibleParentWithDetachedFuncs;
        break;
      }
      possibleParentWithDetachedFuncs = possibleParentWithDetachedFuncs.parent;
    }

    if (closestParentWithDetachedFuncs) {
      set(
        closestParentWithDetachedFuncs,
        'detachedFunctions',
        [...closestParentWithDetachedFuncs.detachedFunctions, ...attachedFunctions]
      );
      for (const func of attachedFunctions) {
        set(func, 'parent', closestParentWithDetachedFuncs);
      }
    }
  },

  /**
   * Rollbacks changes made by `detachArgumentFunctions`.
   * @private
   * @returns {void}
   */
  reattachArgumentFunctions() {
    const attachedFunctions = [...this.functionToRemove.attachedFunctions()];
    if (!attachedFunctions.length) {
      return;
    }

    const closestParentWithDetachedFuncs = attachedFunctions[0].parent;
    for (const func of attachedFunctions) {
      set(func, 'parent', this.functionToRemove);
    }
    set(
      closestParentWithDetachedFuncs,
      'detachedFunctions',
      closestParentWithDetachedFuncs.detachedFunctions.filter((func) =>
        !attachedFunctions.includes(func)
      )
    );
  },

  /**
   * Removes all references to the removed function.
   * @private
   * @returns {void}
   */
  removeReferences() {
    const removedReferences = [];
    for (const referencingElement of this.functionToRemove.referencingElements()) {
      removedReferences.push(
        ...referencingElement.removeElementReferences(this.functionToRemove)
      );
    }
    this.set('removedReferences', removedReferences);
  },

  /**
   * Rollbacks changes made by `removeReferences`.
   * @private
   * @returns {void}
   */
  rollbackReferencesRemoval() {
    this.removedReferences?.forEach((removedReference) => {
      removedReference.referencingElement.rollbackReferenceRemoval(removedReference);
    });
  },
});
