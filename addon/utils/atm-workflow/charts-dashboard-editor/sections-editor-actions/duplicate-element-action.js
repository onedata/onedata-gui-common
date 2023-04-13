/**
 * Duplicates element (section or chart).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import { set, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { ElementType } from '../common';

/**
 * @typedef {Object} DuplicateElementActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section} elementToDuplicate
 */

export default Action.extend({
  /**
   * @virtual
   * @type {DuplicateElementActionContext}
   */
  context: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Section>}
   */
  elementToDuplicate: reads('context.elementToDuplicate'),

  /**
   * Becomes defined during action execution
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section | null}
   */
  createdDuplicate: null,

  /**
   * @type {ComputedProperty<'sections' | 'charts'>}
   */
  collectionName: computed(
    'elementToDuplicate.elementType',
    function collectionName() {
      return this.elementToDuplicate.elementType === ElementType.Section ?
        'sections' : 'charts';
    }
  ),

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.createdDuplicate && !this.createdDuplicate.parentSection) {
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

    const parent = this.elementToDuplicate.parentSection;
    const parentCollection = parent[this.collectionName];
    const elementIndexInParent =
      parentCollection.indexOf(this.elementToDuplicate);
    set(parent, this.collectionName, [
      ...parentCollection.slice(0, elementIndexInParent),
      this.createdDuplicate,
      ...parentCollection.slice(elementIndexInParent),
    ]);
    set(this.createdDuplicate, 'parentSection', parent);
  },

  /**
   * @override
   */
  onExecuteUndo() {
    const parent = this.createdDuplicate.parentSection;
    set(this.createdDuplicate, 'parentSection', null);
    set(
      parent,
      this.collectionName,
      parent[this.collectionName].filter((element) => element !== this.createdDuplicate)
    );
  },
});
