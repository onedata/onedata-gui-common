/**
 * Detaches function from its parent argument binding.
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
 * @typedef {Object} DetachArgumentFunctionActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.FunctionBase} functionToDetach
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartsDashboardEditor.ViewStateChange) => void} changeViewState
 */

export default Action.extend({
  /**
   * @override
   */
  undoPossibility: ActionUndoPossibility.Possible,

  /**
   * @virtual
   * @type {DetachArgumentFunctionActionContext}
   */
  context: undefined,

  /**
   * Becomes defined during action execution
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.FunctionBase | null}
   */
  oldParent: null,

  /**
   * Becomes defined during action execution
   * @type {Array<DashboardElementReference> | null}
   */
  removedReferences: null,

  /**
   * @type {ComputedProperty<DetachArgumentFunctionActionContext['functionToDetach']>}
   */
  functionToDetach: reads('context.functionToDetach'),

  /**
   * @type {ComputedProperty<DetachArgumentFunctionActionContext['changeViewState']>}
   */
  changeViewState: reads('context.changeViewState'),

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.oldParent) {
        this.set('oldParent', null);
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
    this.set('oldParent', this.functionToDetach.parent);

    this.removeReferencesInParent();
    if (this.oldParent) {
      changedElements.addElement(this.oldParent);
    }

    let closestParentWithDetachedFuncs;
    let possibleParentWithDetachedFuncs = this.oldParent;
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
        [...closestParentWithDetachedFuncs.detachedFunctions, this.functionToDetach]
      );
      changedElements.addElement(closestParentWithDetachedFuncs);
      set(this.functionToDetach, 'parent', closestParentWithDetachedFuncs);
    } else {
      set(this.functionToDetach, 'parent', null);
    }
    changedElements.addElement(this.functionToDetach);

    // Due to some unknown Ember issues `functionToDetach.isDetached` does not always
    // recalculate on parent change (but only in Firefox). Enforcing recalculation.
    this.functionToDetach.notifyPropertyChange('isDetached');

    changedElements.notifyAboutChange();

    this.changeViewState({
      elementToSelect: this.functionToDetach,
    });
  },

  /**
   * @override
   */
  onExecuteUndo() {
    const changedElements = new ChangedElementsSet();
    const parentWithDetachedFuncs = this.functionToDetach.parent;

    set(this.functionToDetach, 'parent', this.oldParent);
    changedElements.addElement(this.functionToDetach);

    // Due to some unknown Ember issues `functionToDetach.isDetached` does not always
    // recalculate on parent change (but only in Firefox). Enforcing recalculation.
    this.functionToDetach.notifyPropertyChange('isDetached');

    if (parentWithDetachedFuncs) {
      set(
        parentWithDetachedFuncs,
        'detachedFunctions',
        parentWithDetachedFuncs.detachedFunctions.filter((x) =>
          x !== this.functionToDetach
        )
      );
      changedElements.addElement(parentWithDetachedFuncs);
    }
    this.rollbackReferencesRemovalInParent();
    if (this.oldParent) {
      changedElements.addElement(this.oldParent);
    }

    changedElements.notifyAboutChange();
  },

  /**
   * Removes all references to the detached function from its parent.
   * @private
   * @returns {void}
   */
  removeReferencesInParent() {
    if (this.functionToDetach.parent) {
      this.set(
        'removedReferences',
        this.functionToDetach.parent.removeElementReferences(this.functionToDetach)
      );
    }
  },

  /**
   * Rollbacks changes made by `removeReferences`.
   * @private
   * @returns {void}
   */
  rollbackReferencesRemovalInParent() {
    this.removedReferences?.forEach((removedReference) => {
      removedReference.referencingElement.rollbackReferenceRemoval(removedReference);
    });
  },
});
