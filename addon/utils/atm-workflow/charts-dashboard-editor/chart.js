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
   * @type {Array<Utils.AtmWorkflow.ChartsDashboardEditor.Axis>}
   */
  axes: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Array<Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup>}
   */
  seriesGroups: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Array<Utils.AtmWorkflow.ChartsDashboardEditor.Series>}
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
   * @type {ComputedProperty<Array<Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup>>}
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
      axes: this.axes.map((axis) => axis.clone()),
      seriesGroups: this.seriesGroups.map((group) => group.clone()),
      series: this.series.map((series) => series.clone()),
      parent: this.parent,
    });
    [
      ...clonedInstance.axes,
      ...clonedInstance.seriesGroups,
      ...clonedInstance.series,
    ].forEach((element) => {
      set(element, 'parent', clonedInstance);
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
