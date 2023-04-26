/**
 * Removes element (section or chart).
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
   * @type {number | null}
   */
  oldIndexInParent: null,

  /**
   * @type {ComputedProperty<string>}
   */
  collectionName: computed(
    'elementToRemove.elementType',
    function collectionName() {
      return getCollectionFieldName(this.elementToRemove.elementType);
    }
  ),

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
    const parent = this.elementToRemove.parent;
    this.setProperties({
      oldParent: parent,
      oldIndexInParent: parent[this.collectionName].indexOf(this.elementToRemove),
    });

    set(
      parent,
      this.collectionName,
      parent[this.collectionName].filter((element) => element !== this.elementToRemove)
    );
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
    set(this.oldParent, this.collectionName, [
      ...this.oldParent[this.collectionName].slice(0, this.oldIndexInParent),
      this.elementToRemove,
      ...this.oldParent[this.collectionName].slice(this.oldIndexInParent),
    ]);
  },
});
