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
   * @type {ComputedProperty<DetachArgumentFunctionActionContext['functionToDetach']>}
   */
  functionToDetach: reads('context.functionToDetach'),

  /**
   * @type {ComputedProperty<DetachArgumentFunctionActionContext['changeViewState']>}
   */
  changeViewState: reads('context.changeViewState'),

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
   * Becomes defined during action execution
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement | null}
   */
  closestParentWithDetachedFuncs: null,

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
      if (this.closestParentWithDetachedFuncs) {
        this.set('closestParentWithDetachedFuncs', null);
      }
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onExecute() {
    this.set('oldParent', this.functionToDetach.parent);

    this.removeReferencesInParent();

    let closestParentWithDetachedFuncs = this.closestParentWithDetachedFuncs;
    let possibleParentWithDetachedFuncs = this.oldParent;
    while (!closestParentWithDetachedFuncs && possibleParentWithDetachedFuncs) {
      if (possibleParentWithDetachedFuncs.detachedFunctions) {
        closestParentWithDetachedFuncs = possibleParentWithDetachedFuncs;
        break;
      }
      possibleParentWithDetachedFuncs = possibleParentWithDetachedFuncs.parent;
    }

    if (closestParentWithDetachedFuncs) {
      if (!this.closestParentWithDetachedFuncs) {
        this.set('closestParentWithDetachedFuncs', closestParentWithDetachedFuncs);
      }

      set(
        closestParentWithDetachedFuncs,
        'detachedFunctions',
        [...closestParentWithDetachedFuncs.detachedFunctions, this.functionToDetach]
      );
      set(this.functionToDetach, 'parent', this.closestParentWithDetachedFuncs);
    } else {
      set(this.functionToDetach, 'parent', null);
    }

    this.changeViewState({
      elementToSelect: this.functionToDetach,
    });
  },

  /**
   * @override
   */
  onExecuteUndo() {
    set(this.functionToDetach, 'parent', this.oldParent);
    if (this.closestParentWithDetachedFuncs) {
      set(
        this.closestParentWithDetachedFuncs,
        'detachedFunctions',
        this.closestParentWithDetachedFuncs.detachedFunctions.filter((x) =>
          x !== this.functionToDetach
        )
      );
    }
    this.rollbackReferencesRemovalInParent();
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
