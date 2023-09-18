/**
 * Removes dashboard element.
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
   * @type {ComputedProperty<RemoveElementActionContext['elementToRemove']>}
   */
  elementToRemove: reads('context.elementToRemove'),

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
        this.elementToRemove?.destroy();
      }
      this.setProperties({
        oldParent: null,
        removedReferences: null,
      });
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onExecute() {
    const changedElements = new ChangedElementsSet();
    this.set('oldParent', this.elementToRemove.parent);

    this.removeReferences();
    this.removedReferences?.forEach(({ referencingElement }) =>
      changedElements.addElement(referencingElement)
    );
    set(this.elementToRemove, 'parent', null);
    [this.elementToRemove, ...this.elementToRemove.nestedElements()]
    .forEach((element) => set(element, 'isRemoved', true));

    if (this.oldParent) {
      changedElements.addElement(this.oldParent);
    }

    changedElements.notifyAboutChange();
    this.changeViewState({
      elementsToDeselect: [
        this.elementToRemove,
        ...this.elementToRemove.nestedElements(),
      ],
    });
  },

  /**
   * @override
   */
  onExecuteUndo() {
    const changedElements = new ChangedElementsSet();
    set(this.elementToRemove, 'parent', this.oldParent);
    [this.elementToRemove, ...this.elementToRemove.nestedElements()]
    .forEach((element) => set(element, 'isRemoved', false));
    this.rollbackReferencesRemoval();
    this.removedReferences?.forEach(({ referencingElement }) =>
      changedElements.addElement(referencingElement)
    );
    if (this.oldParent) {
      changedElements.addElement(this.oldParent);
    }
    changedElements.notifyAboutChange();
  },

  /**
   * Removes all references to the removed element and all its nested elements.
   * @private
   * @returns {void}
   */
  removeReferences() {
    const elementsToRemove = new Set([
      this.elementToRemove,
      ...this.elementToRemove.nestedElements(),
    ]);
    const allRemovedReferences = [];
    for (const elementToRemove of elementsToRemove) {
      for (const referencingElement of elementToRemove.referencingElements()) {
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
