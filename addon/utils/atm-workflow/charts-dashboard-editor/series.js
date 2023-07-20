/**
 * Model of a single chart series for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import ElementBase from './element-base';
import generateId from 'onedata-gui-common/utils/generate-id';
import { ElementType } from './common';
import functions from './functions-model';
import { createTimeSeriesRefChangesHandler } from './functions-model/load-series';

/**
 * @typedef {Object} TimeSeriesGeneratorRef
 * @property {string | null} collectionRef
 * @property {string} timeSeriesNameGenerator
 * @property {Array<string>} metricNames
 */

/**
 * @typedef {DashboardElementValidationError} SeriesNameEmptyValidationError
 * @property {'seriesNameEmpty'} errorId
 */

/**
 * @typedef {DashboardElementValidationError} SeriesAxisNotAssignedValidationError
 * @property {'seriesAxisNotAssigned'} errorId
 */

const Series = ElementBase.extend(createTimeSeriesRefChangesHandler('prefixedTimeSeriesRef', false), {
  /**
   * @override
   */
  elementType: ElementType.Series,

  /**
   * @public
   * @virtual
   * @type {string}
   */
  id: undefined,

  /**
   * @public
   * @virtual
   * @type {Array<ChartsDashboardEditorDataSource>}
   */
  dataSources: undefined,

  /**
   * @public
   * @virtual optional
   * @type {boolean}
   */
  repeatPerPrefixedTimeSeries: false,

  /**
   * @public
   * @virtual optional
   * @type {EmberObject<TimeSeriesGeneratorRef>}
   */
  prefixedTimeSeriesRef: undefined,

  /**
   * @public
   * @virtual optional
   * @type {string}
   */
  name: '',

  /**
   * @public
   * @virtual optional
   * @type {OTSCChartType}
   */
  type: 'line',

  /**
   * `null` is an invalid state
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Axis | null}
   */
  axis: null,

  /**
   * @public
   * @virtual optional
   * @type {string | null}
   */
  color: null,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup | null}
   */
  group: null,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.SeriesOutput}
   */
  dataProvider: undefined,

  /**
   * @public
   * @type {Array<Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.FunctionBase>}
   */
  detachedFunctions: undefined,

  /**
   * @override
   */
  needsDataSources: true,

  /**
   * @override
   */
  referencingPropertyNames: Object.freeze([
    'parent',
    'axis',
    'group',
    'dataProvider',
    'detachedFunctions',
  ]),

  /**
   * @override
   */
  directValidationErrors: computed(
    'repeatPerPrefixedTimeSeries',
    'name',
    'axis',
    function directValidationErrors() {
      const errors = [];
      if (!this.repeatPerPrefixedTimeSeries && !this.name) {
        errors.push({
          element: this,
          errorId: 'seriesNameEmpty',
        });
      }
      if (!this.axis) {
        errors.push({
          element: this,
          errorId: 'seriesAxisNotAssigned',
        });
      }
      return errors;
    }
  ),

  /**
   * @override
   */
  init() {
    if (!this.id) {
      this.set('id', generateId());
    }
    if (!this.dataProvider) {
      this.set('dataProvider', functions.seriesOutput.modelClass.create({
        parent: this,
        elementOwner: this.elementOwner,
      }));
    }
    if (!this.detachedFunctions) {
      this.set('detachedFunctions', []);
    }
    if (!this.prefixedTimeSeriesRef) {
      this.set('prefixedTimeSeriesRef', EmberObject.create({
        collectionRef: '',
        timeSeriesNameGenerator: '',
        metricNames: [],
      }));
    }

    this._super(...arguments);
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      if (this.prefixedTimeSeriesRef) {
        this.prefixedTimeSeriesRef.destroy();
        this.set('prefixedTimeSeriesRef', null);
      }
      if (this.axis) {
        this.set('axis', null);
      }
      if (this.group) {
        this.set('group', null);
      }
      if (this.dataProvider) {
        this.dataProvider.destroy();
        this.set('dataProvider', null);
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
    return Series.create({
      elementOwner: this.elementOwner,
      id: generateId(),
      repeatPerPrefixedTimeSeries: this.repeatPerPrefixedTimeSeries,
      prefixedTimeSeriesRef: this.prefixedTimeSeriesRef ?
        EmberObject.create(this.prefixedTimeSeriesRef) : this.prefixedTimeSeriesRef,
      name: this.name,
      type: this.type,
      axis: this.axis,
      color: this.color,
      group: this.group,
      parent: this.parent,
    });
  },

  /**
   * @override
   */
  * referencingElements() {
    if (this.parent) {
      yield this.parent;
    }
    if (this.axis) {
      yield this.axis;
    }
    if (this.group) {
      yield this.group;
    }
  },
});

export default Series;
