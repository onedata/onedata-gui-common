/**
 * Adds new element to specific section.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action, { ActionUndoPossibility } from 'onedata-gui-common/utils/action';
import { set, setProperties, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import {
  createNewSection,
  createNewChart,
  createNewAxis,
  createNewSeriesGroup,
  createNewSeries,
} from '../create-model';
import { ElementType, isSectionElementType } from '../common';

/**
 * @typedef {Object} AddElementActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.ElementType} newElementType
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement} targetElement
 * @property {(viewStateChange: Utils.AtmWorkflow.ChartsDashboardEditor.ViewStateChange) => void} changeViewState
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
   * @type {ComputedProperty<AddElementActionContext['targetElement']>}
   */
  targetElement: reads('context.targetElement'),

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
   * @type {ComputedProperty<'sections' | 'charts' | 'axes' | 'seriesGroups' | 'subgroups' | 'series'>}
   */
  collectionName: computed(
    'newElementType',
    'targetElement.elementType',
    function collectionName() {
      switch (this.newElementType) {
        case ElementType.Section:
          return 'sections';
        case ElementType.Chart:
          return 'charts';
        case ElementType.Axis:
          return 'axes';
        case ElementType.SeriesGroup:
          return this.targetElement.elementType === ElementType.SeriesGroup ?
            'subgroups' : 'seriesGroups';
        case ElementType.Series:
          return 'series';
      }
    }
  ),

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
    // Create new element
    if (!this.newElement) {
      this.set('newElement', this.createNewElement());
      if (!this.newElement) {
        return;
      }
    }

    // Assign parent
    if (isSectionElementType(this.newElementType)) {
      set(this.newElement, 'parentSection', this.targetElement);
    } else if (this.targetElement.elementType === ElementType.SeriesGroup) {
      setProperties(this.newElement, {
        parentChart: this.targetElement.parentChart,
        parentGroup: this.targetElement,
      });
    } else {
      set(this.newElement, 'parentChart', this.targetElement);
    }

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
    if (this.newElement.parentSection) {
      set(this.newElement, 'parentSection', null);
    } else if (this.newElement.parentChart) {
      set(this.newElement, 'parentChart', null);
      if (this.newElement.parentGroup) {
        set(this.newElement, 'parentGroup', null);
      }
    }

    if (this.newElementType === ElementType.Series && this.newElement.axis) {
      set(
        this.newElement.axis,
        'series',
        this.newElement.axis.series.filter((series) => series !== this.newElement)
      );
      set(this.newElement, 'axis', null);
    }

    this.changeViewState({
      elementsToDeselect: [this.newElement, ...this.newElement.getNestedElements()],
    });
  },

  /**
   * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.DashboardElement | null}
   */
  createNewElement() {
    const elementOwner = this.targetElement.elementOwner;

    switch (this.newElementType) {
      case ElementType.Section:
        return createNewSection(this.i18n, elementOwner);
      case ElementType.Chart:
        return createNewChart(this.i18n, elementOwner);
      case ElementType.Axis:
        return createNewAxis(this.i18n, elementOwner);
      case ElementType.SeriesGroup:
        return createNewSeriesGroup(this.i18n, elementOwner);
      case ElementType.Series:
        return createNewSeries(this.i18n, elementOwner);
      default:
        console.error(
          `Could not create charts dashboard element of type "${this.newElementType}" - type not recognized.`
        );
        return null;
    }
  },
});
