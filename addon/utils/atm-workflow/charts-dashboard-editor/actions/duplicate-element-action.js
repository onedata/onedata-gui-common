/**
 * Duplicates dashboard element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { set, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { getCollectionFieldName } from './utils';

/**
 * @typedef {Object} DuplicateElementActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement} elementToDuplicate
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartsDashboardEditor.ViewStateChange) => void} changeViewState
 */

export default Action.extend({
  /**
   * @override
   */
  undoPossibility: ActionUndoPossibility.Possible,

  /**
   * @virtual
   * @type {DuplicateElementActionContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<DuplicateElementActionContext['elementToDuplicate']>}
   */
  elementToDuplicate: reads('context.elementToDuplicate'),

  /**
   * @type {ComputedProperty<DuplicateElementActionContext['changeViewState']>}
   */
  changeViewState: reads('context.changeViewState'),

  /**
   * Becomes defined during action execution
   * @type {DuplicateElementActionContext['elementToDuplicate'] | null}
   */
  createdDuplicate: null,

  /**
   * @type {ComputedProperty<string>}
   */
  collectionName: computed(
    'elementToDuplicate.elementType',
    function collectionName() {
      return getCollectionFieldName(this.elementToDuplicate.elementType);
    }
  ),

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.createdDuplicate && !this.createdDuplicate.parent) {
        this.createdDuplicate.destroy();
      }
      this.setProperties({
        context: null,
        createdDuplicate: null,
      });
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onExecute() {
    if (!this.createdDuplicate) {
      this.set('createdDuplicate', this.elementToDuplicate.clone());
    }

    const parent = this.elementToDuplicate.parent;
    const parentCollection = parent[this.collectionName];
    const elementIndexInParent =
      parentCollection.indexOf(this.elementToDuplicate);
    set(parent, this.collectionName, [
      ...parentCollection.slice(0, elementIndexInParent + 1),
      this.createdDuplicate,
      ...parentCollection.slice(elementIndexInParent + 1),
    ]);
    set(this.createdDuplicate, 'parent', parent);
    this.changeViewState({ elementToSelect: this.createdDuplicate });
  },

  /**
   * @override
   */
  onExecuteUndo() {
    const parent = this.createdDuplicate.parent;
    set(this.createdDuplicate, 'parent', null);
    set(
      parent,
      this.collectionName,
      parent[this.collectionName].filter((element) => element !== this.createdDuplicate)
    );
    this.changeViewState({
      elementsToDeselect: [
        this.createdDuplicate,
        ...this.createdDuplicate.nestedElements(),
      ],
    });
  },
});
