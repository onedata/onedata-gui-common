/**
 * Model of a single chart series for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, set } from '@ember/object';
import ElementBase from './element-base';
import generateId from 'onedata-gui-common/utils/generate-id';
import { ElementType } from './common';
import functions from './functions-model';
import TimeSeriesRefChangesHandler from './time-series-ref-changes-handler';

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

const Series = ElementBase.extend({
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
   * Set in `init`.
   * @type {TimeSeriesRefChangesHandler}
   */
  timeSeriesRefChangesHandler: undefined,

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
    this.set('timeSeriesRefChangesHandler', TimeSeriesRefChangesHandler.create({
      timeSeriesRefContainer: this,
      timeSeriesRefFieldName: 'prefixedTimeSeriesRef',
      ignoreTimeSeriesName: true,
    }));

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
      if (this.detachedFunctions.length) {
        this.detachedFunctions.forEach((chartFunction) => chartFunction.destroy());
        this.set('detachedFunctions', []);
      }
      if (this.parent) {
        this.set('parent', null);
      }
      if (this.timeSeriesRefChangesHandler) {
        this.timeSeriesRefChangesHandler.destroy();
        this.set('timeSeriesRefChangesHandler', null);
      }
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  clone() {
    const seriesClone = Series.create({
      elementOwner: this.elementOwner,
      id: generateId(),
      dataSources: this.dataSources,
      repeatPerPrefixedTimeSeries: this.repeatPerPrefixedTimeSeries,
      prefixedTimeSeriesRef: this.prefixedTimeSeriesRef ?
        EmberObject.create(this.prefixedTimeSeriesRef) : this.prefixedTimeSeriesRef,
      name: this.name,
      type: this.type,
      axis: this.axis,
      color: this.color,
      group: this.group,
      dataProvider: this.dataProvider?.clone(),
      detachedFunctions: this.detachedFunctions.map((func) => func.clone()),
      parent: this.parent,
    });

    if (seriesClone.dataProvider) {
      set(seriesClone.dataProvider, 'parent', seriesClone);
    }
    seriesClone.detachedFunctions.forEach((func) =>
      set(func, 'parent', seriesClone)
    );

    return seriesClone;
  },

  /**
   * @override
   */
  toJson() {
    const yAxisId = this.axis?.id ?? null;
    const groupId = this.group?.id ?? null;
    const dataProvider = this.dataProvider?.toJson();

    if (this.repeatPerPrefixedTimeSeries) {
      return {
        builderType: 'dynamic',
        builderRecipe: {
          dynamicSeriesConfigsSource: {
            sourceType: 'external',
            sourceSpec: {
              externalSourceName: 'store',
              externalSourceParameters: {
                collectionRef: this.prefixedTimeSeriesRef.collectionRef,
                timeSeriesNameGenerator: this.prefixedTimeSeriesRef
                  .timeSeriesNameGenerator,
                metricNames: this.prefixedTimeSeriesRef.metricNames,
              },
            },
          },
          seriesTemplate: {
            idProvider: {
              functionName: 'getDynamicSeriesConfig',
              functionArguments: {
                propertyName: 'id',
              },
            },
            nameProvider: {
              functionName: 'getDynamicSeriesConfig',
              functionArguments: {
                propertyName: 'name',
              },
            },
            typeProvider: {
              functionName: 'literal',
              functionArguments: {
                data: this.type,
              },
            },
            yAxisIdProvider: {
              functionName: 'literal',
              functionArguments: {
                data: yAxisId,
              },
            },
            groupIdProvider: {
              functionName: 'literal',
              functionArguments: {
                data: groupId,
              },
            },
            colorProvider: {
              functionName: 'literal',
              functionArguments: {
                data: this.color,
              },
            },
            dataProvider,
          },
        },
      };
    }

    return {
      builderType: 'static',
      builderRecipe: {
        seriesTemplate: {
          id: this.id,
          name: this.name,
          type: this.type,
          yAxisId,
          groupId,
          color: this.color,
          dataProvider,
        },
      },
    };
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
