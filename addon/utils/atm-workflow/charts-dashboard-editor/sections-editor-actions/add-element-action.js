/**
 * Adds new element to specific section.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import { set, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import {
  createNewChart,
  createNewSection,
} from '../create-model';
import { ElementType } from '../common';

/**
 * @typedef {Object} AddElementActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.ElementType} newElementType
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.Section} targetSection
 */

export default Action.extend({
  i18n: service(),

  /**
   * @virtual
   * @type {AddSubsectionActionContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.ElementType>}
   */
  newElementType: reads('context.newElementType'),

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Section>}
   */
  targetSection: reads('context.targetSection'),

  /**
   * Becomes defined during action execution
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section | null}
   */
  newElement: null,

  /**
   * @type {ComputedProperty<'sections' | 'charts'>}
   */
  collectionName: computed('newElementType', function collectionName() {
    return this.newElementType === ElementType.Section ?
      'sections' : 'charts';
  }),

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.newElement && !this.newElement.parentSection) {
        this.newElement.destroy();
      }
      this.setProperties({
        context: null,
        newElement: null,
      });
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onExecute() {
    if (!this.newElement) {
      this.set('newElement', this.newElementType === ElementType.Section ?
        createNewSection(this.i18n) : createNewChart(this.i18n)
      );
    }
    set(this.newElement, 'parentSection', this.targetSection);
    set(this.targetSection, this.collectionName, [
      ...this.targetSection[this.collectionName],
      this.newElement,
    ]);
  },

  /**
   * @override
   */
  onExecuteUndo() {
    set(
      this.targetSection,
      this.collectionName,
      this.targetSection[this.collectionName]
      .filter((element) => element !== this.newElement)
    );
    set(this.newElement, 'parentSection', null);
  },
});
