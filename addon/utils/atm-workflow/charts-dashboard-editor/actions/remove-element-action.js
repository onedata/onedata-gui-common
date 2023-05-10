/**
 * Removes element (section or chart).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { set } from '@ember/object';
import { reads } from '@ember/object/computed';

/**
 * @typedef {Object} RemoveElementActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement} elementToRemove
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
   * @type {ComputedProperty<RemoveElementActionContext['elementToRemove']>}
   */
  elementToRemove: reads('context.elementToRemove'),

  /**
   * @type {ComputedProperty<RemoveElementActionContext['changeViewState']>}
   */
  changeViewState: reads('context.changeViewState'),

  /**
   * Becomes defined during action execution
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement | null}
   */
  oldParent: null,

  /**
   * Becomes defined during action execution
   * @type {Array<DashboardElementReference> | null}
   */
  removedReferences: null,

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.elementToRemove && !this.elementToRemove.parent) {
        this.elementToRemove.destroy();
      }
      this.setProperties({
        context: null,
        oldParent: null,
      });
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onExecute() {
    this.set('oldParent', this.elementToRemove.parent);

    this.removeReferences();
    set(this.elementToRemove, 'parent', null);

    this.changeViewState({
      elementsToDeselect: [
        this.elementToRemove,
        ...this.elementToRemove.getNestedElements(),
      ],
    });
  },

  /**
   * @override
   */
  onExecuteUndo() {
    set(this.elementToRemove, 'parent', this.oldParent);
    this.rollbackReferencesRemoval();
  },

  removeReferences() {
    const elementsToRemove = new Set([
      this.elementToRemove,
      ...this.elementToRemove.getNestedElements(),
    ]);
    const allRemovedReferences = [];
    for (const elementToRemove of elementsToRemove) {
      for (const referencingElement of elementToRemove.getReferencingElements()) {
        if (elementsToRemove.has(referencingElement)) {
          continue;
        }
        allRemovedReferences.push(
          ...referencingElement.removeElementReferences(elementToRemove)
        );
      }
    }
    this.set('removedReferences', allRemovedReferences);
  },

  rollbackReferencesRemoval() {
    this.removedReferences?.forEach((removedReference) => {
      removedReference.referencingElement.rollbackReferenceRemoval(removedReference);
    });
  },
});
