/**
 * Model of a single chart for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, set } from '@ember/object';
import _ from 'lodash';
import ElementBase from './element-base';
import { ElementType } from './common';

const Chart = ElementBase.extend({
  /**
   * @override
   */
  elementType: ElementType.Chart,

  /**
   * @public
   * @virtual optional
   * @type {string}
   */
  title: '',

  /**
   * @public
   * @virtual optional
   * @type {string}
   */
  titleTip: '',

  /**
   * @public
   * @virtual optional
   * @type {Array<Utils.AtmWorkflow.ChartDashboardEditor.Axis>}
   */
  axes: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Array<Utils.AtmWorkflow.ChartDashboardEditor.SeriesGroup>}
   */
  seriesGroups: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Array<Utils.AtmWorkflow.ChartDashboardEditor.Series>}
   */
  series: undefined,

  /**
   * @public
   * @virtual optional
   * @type {boolean}
   */
  isSelected: false,

  /**
   * @override
   */
  referencingPropertyNames: Object.freeze(['axes', 'seriesGroups', 'series', 'parent']),

  /**
   * @override
   */
  nestedValidationErrors: computed(
    'axes.@each.validationErrors',
    'seriesGroups.@each.validationErrors',
    'series.@each.validationErrors',
    function nestedValidationErrors() {
      return _.flatten(
        [...this.axes, ...this.seriesGroups, ...this.series]
        .map(({ validationErrors }) => validationErrors)
      );
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.AtmWorkflow.ChartDashboardEditor.SeriesGroup>>}
   */
  deepSeriesGroups: computed(
    'seriesGroups.@each.deepSeriesGroups',
    function deepSeriesGroups() {
      const groups = [];
      this.seriesGroups.forEach((group) => {
        groups.push(group, ...group.deepSeriesGroups);
      });
      return groups;
    }
  ),

  /**
   * @override
   */
  init() {
    if (!this.axes) {
      this.set('axes', []);
    }
    if (!this.seriesGroups) {
      this.set('seriesGroups', []);
    }
    if (!this.series) {
      this.set('series', []);
    }

    this._super(...arguments);
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.axes.length) {
        this.axes.forEach((axis) => axis.destroy());
        this.set('axes', []);
      }
      if (this.seriesGroups.length) {
        this.seriesGroups.forEach((group) => group.destroy());
        this.set('seriesGroups', []);
      }
      if (this.series.length) {
        this.series.forEach((series) => series.destroy());
        this.set('series', []);
      }
      if (this.parent) {
        this.set('parent', null);
      }
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  clone() {
    const clonedInstance = Chart.create({
      elementOwner: this.elementOwner,
      dataSources: this.dataSources,
      title: this.title,
      titleTip: this.titleTip,
      axes: this.axes.map((axis) => axis.clone(true)),
      seriesGroups: this.seriesGroups.map((group) => group.clone(true)),
      series: this.series.map((series) => series.clone(true)),
      parent: this.parent,
    });
    [
      ...clonedInstance.axes,
      ...clonedInstance.seriesGroups,
      ...clonedInstance.series,
    ].forEach((element) => {
      set(element, 'parent', clonedInstance);
    });
    ['axes', 'deepSeriesGroups', 'series'].forEach((collectionName) => {
      const oldCollection = this[collectionName];
      const newCollection = clonedInstance[collectionName];
      for (let i = 0; i < oldCollection.length; i++) {
        clonedInstance.replaceReference(oldCollection[i], newCollection[i]);
      }
    });

    return clonedInstance;
  },

  /**
   * @override
   */
  toJson() {
    return {
      title: {
        content: this.title,
        tip: this.titleTip,
      },
      yAxes: this.axes.map((axis) => axis.toJson()),
      seriesGroupBuilders: this.seriesGroups.map((seriesGroup) => seriesGroup.toJson()),
      seriesBuilders: this.series.map((singleSeries) => singleSeries.toJson()),
    };
  },

  /**
   * @override
   */
  * nestedElements() {
    for (const element of [...this.axes, ...this.seriesGroups, ...this.series]) {
      yield element;
      yield* element.nestedElements();
    }
  },

  /**
   * @override
   */
  * referencingElements() {
    if (this.parent) {
      yield this.parent;
    }
  },
});

export default Chart;
