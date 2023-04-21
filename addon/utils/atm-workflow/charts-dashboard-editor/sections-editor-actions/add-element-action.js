/**
 * Adds new element to specific section.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { set, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import {
  createNewChart,
  createNewSection,
} from '../create-model';
import { ElementType } from '../common';

/**
 * @typedef {Object} AddElementActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.ElementType} newElementType
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.Section} targetSection
 * @property {(elementToSelect: Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section | null) => void} onSelectElement
 * @property {(elementToDeselect: Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section) => void} onDeselectElement
 */

export default Action.extend({
  /**
   * @override
   */
  undoPossibility: ActionUndoPossibility.Possible,

  /**
   * @virtual
   * @type {AddElementActionContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<AddElementActionContext['newElementType']>}
   */
  newElementType: reads('context.newElementType'),

  /**
   * @type {ComputedProperty<AddElementActionContext['targetSection']>}
   */
  targetSection: reads('context.targetSection'),

  /**
   * @type {ComputedProperty<AddElementActionContext['onSelectElement']>}
   */
  onSelectElement: reads('context.onSelectElement'),

  /**
   * @type {ComputedProperty<AddElementActionContext['onDeselectElement']>}
   */
  onDeselectElement: reads('context.onDeselectElement'),

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
      const elementOwner = this.targetSection.elementOwner;
      this.set('newElement', this.newElementType === ElementType.Section ?
        createNewSection(this.i18n, elementOwner) :
        createNewChart(this.i18n, elementOwner)
      );
    }
    set(this.newElement, 'parentSection', this.targetSection);
    set(this.targetSection, this.collectionName, [
      ...this.targetSection[this.collectionName],
      this.newElement,
    ]);
    this.onSelectElement(this.newElement);
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
    this.onDeselectElement(this.newElement);
    [...this.newElement.getNestedElements()].forEach((element) =>
      this.onDeselectElement(element)
    );
  },
});
