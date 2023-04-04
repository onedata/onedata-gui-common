/**
 * Removes element (section or chart).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import { set, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { SectionElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/section';

/**
 * @typedef {Object} RemoveElementActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.Section} elementToRemove
 */

export default Action.extend({
  i18n: service(),

  /**
   * @virtual
   * @type {RemoveElementActionContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Section>}
   */
  elementToRemove: reads('context.elementToRemove'),

  /**
   * Becomes defined during action execution
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Section | null}
   */
  oldParent: null,

  /**
   * Becomes defined during action execution
   * @type {number | null}
   */
  oldIndexInParent: null,

  /**
   * @type {ComputedProperty<'sections' | 'charts'>}
   */
  collectionName: computed(
    'elementToRemove.elementType',
    function collectionName() {
      return this.elementToRemove.elementType === SectionElementType ?
        'sections' : 'charts';
    }
  ),

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.elementToRemove && !this.elementToRemove.parentSection) {
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
    const parent = this.elementToRemove.parentSection;
    this.setProperties({
      oldParent: parent,
      oldIndexInParent: parent[this.collectionName].indexOf(this.elementToRemove),
    });

    set(
      parent,
      this.collectionName,
      parent[this.collectionName].filter((element) => element !== this.elementToRemove)
    );
    set(this.elementToRemove, 'parentSection', null);
  },

  /**
   * @override
   */
  onExecuteUndo() {
    set(this.elementToRemove, 'parentSection', this.oldParent);
    set(this.oldParent, this.collectionName, [
      ...this.oldParent[this.collectionName].slice(0, this.oldIndexInParent),
      this.elementToRemove,
      ...this.oldParent[this.collectionName].slice(this.oldIndexInParent),
    ]);
  },
});
