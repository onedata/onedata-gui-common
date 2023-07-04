/**
 * Adds new element to specific target.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { set, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import {
  createNewSection,
  createNewChart,
  createNewAxis,
  createNewSeriesGroup,
  createNewSeries,
} from '../create-model';
import { ElementType } from '../common';
import { getCollectionFieldName } from './utils';

/**
 * @typedef {Object} AddElementActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.ElementType} newElementType
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement | Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup} targetElement
 * @property {Array<ChartsDashboardEditorDataSource>} dataSources
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartsDashboardEditor.ViewStateChange) => void} changeViewState
 */

const creatorFunctions = Object.freeze({
  [ElementType.Section]: createNewSection,
  [ElementType.Chart]: createNewChart,
  [ElementType.Axis]: createNewAxis,
  [ElementType.SeriesGroup]: createNewSeriesGroup,
  [ElementType.Series]: createNewSeries,
});

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
   * @type {ComputedProperty<AddElementActionContext['targetElement']>}
   */
  targetElement: reads('context.targetElement'),

  /**
   * @type {ComputedProperty<AddFunctionActionContext['dataSources']>}
   */
  dataSources: reads('context.dataSources'),

  /**
   * @type {ComputedProperty<AddElementActionContext['changeViewState']>}
   */
  changeViewState: reads('context.changeViewState'),

  /**
   * Becomes defined during action execution
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement | null}
   */
  newElement: null,

  /**
   * @type {ComputedProperty<string>}
   */
  collectionName: computed('newElementType', function collectionName() {
    return getCollectionFieldName(this.newElementType);
  }),

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.newElement && !this.newElement.parent) {
        this.newElement.destroy();
      }
      this.set('newElement', null);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onExecute() {
    // Create new element
    if (!this.newElement) {
      this.set('newElement', this.createNewElement());
      if (!this.newElement) {
        return;
      }
    } else {
      [this.newElement, ...this.newElement.nestedElements()].forEach((element) =>
        set(element, 'isRemoved', false)
      );
    }

    // Assign parent
    set(this.newElement, 'parent', this.targetElement);

    // If new element is of type "series", try to assign an axis to it
    if (this.newElementType === ElementType.Series) {
      const firstAxis = this.targetElement.axes?.[0];
      if (firstAxis) {
        set(this.newElement, 'axis', firstAxis);
        set(firstAxis, 'series', [
          ...firstAxis.series,
          this.newElement,
        ]);
      }
    }

    // Add element to parent's collection
    set(this.targetElement, this.collectionName, [
      ...this.targetElement[this.collectionName],
      this.newElement,
    ]);

    this.changeViewState({ elementToSelect: this.newElement });
  },

  /**
   * @override
   */
  onExecuteUndo() {
    if (!this.newElement) {
      return;
    }

    set(
      this.targetElement,
      this.collectionName,
      this.targetElement[this.collectionName]
      .filter((element) => element !== this.newElement)
    );
    set(this.newElement, 'parent', null);

    if (this.newElementType === ElementType.Series && this.newElement.axis) {
      set(
        this.newElement.axis,
        'series',
        this.newElement.axis.series.filter((series) => series !== this.newElement)
      );
      set(this.newElement, 'axis', null);
    }

    [this.newElement, ...this.newElement.nestedElements()].forEach((element) =>
      set(element, 'isRemoved', true)
    );

    this.changeViewState({
      elementsToDeselect: [this.newElement, ...this.newElement.nestedElements()],
    });
  },

  /**
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement | null}
   */
  createNewElement() {
    const elementOwner = this.targetElement.elementOwner;

    const creatorFunction = creatorFunctions[this.newElementType];
    if (creatorFunction) {
      const element = creatorFunction(this.i18n, elementOwner);
      if (element.needsDataSources && this.dataSources) {
        set(element, 'dataSources', this.dataSources);
      }
      return element;
    } else {
      console.error(
        `Could not create charts dashboard element of type "${this.newElementType}" - type not recognized.`
      );
      return null;
    }
  },
});
