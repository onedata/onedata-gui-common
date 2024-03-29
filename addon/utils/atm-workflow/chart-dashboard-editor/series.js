/**
 * Model of a single chart series for the dashboard editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, set } from '@ember/object';
import _ from 'lodash';
import ElementBase from './element-base';
import generateId from 'onedata-gui-common/utils/generate-id';
import { ElementType } from './common';
import functions from './functions-model';
import TimeSeriesRefChangesHandler from './time-series-ref-changes-handler';
import { validateTimeSeriesRef } from './functions-model/load-series';

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
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Axis | null}
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
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.SeriesGroup | null}
   */
  group: null,

  /**
   * @public
   * @virtual optional
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.FunctionsModel.SeriesOutput}
   */
  dataProvider: undefined,

  /**
   * @public
   * @type {Array<Utils.AtmWorkflow.ChartDashboardEditor.FunctionsModel.FunctionBase>}
   */
  detachedFunctions: undefined,

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
    'prefixedTimeSeriesRef.{collectionRef,timeSeriesNameGenerator,metricNames.[]}',
    'dataSources.[]',
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
      if (this.repeatPerPrefixedTimeSeries) {
        errors.push(...validateTimeSeriesRef(
          this.prefixedTimeSeriesRef,
          this.dataSources,
          true
        ));
      }
      return errors;
    }
  ),

  /**
   * @override
   */
  nestedValidationErrors: computed(
    'dataProvider.validationErrors',
    'detachedFunctions.@each.validationErrors',
    function nestedValidationErrors() {
      return _.flatten(
        [this.dataProvider, ...this.detachedFunctions]
        .map(({ validationErrors }) => validationErrors)
      );
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
  clone(preserveReferences = false) {
    const seriesClone = Series.create({
      elementOwner: this.elementOwner,
      dataSources: this.dataSources,
      id: generateId(),
      repeatPerPrefixedTimeSeries: this.repeatPerPrefixedTimeSeries,
      prefixedTimeSeriesRef: this.prefixedTimeSeriesRef ?
        EmberObject.create(this.prefixedTimeSeriesRef) : this.prefixedTimeSeriesRef,
      name: this.name,
      type: this.type,
      axis: this.axis,
      color: this.color,
      group: this.group,
      dataProvider: this.dataProvider?.clone(preserveReferences),
      detachedFunctions: this.detachedFunctions
        .map((func) => func.clone(preserveReferences)),
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
    const color = this.repeatPerPrefixedTimeSeries ? null : this.color;
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
                collectionRef: this.prefixedTimeSeriesRef.collectionRef ??
                  this.defaultDataSource?.collectionRef,
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
                data: color,
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
          color,
          dataProvider,
        },
      },
    };
  },

  /**
   * @override
   */
  * nestedElements() {
    if (this.dataProvider) {
      yield this.dataProvider;
      yield* this.dataProvider.nestedElements();
    }
    for (const detachedFunction of this.detachedFunctions) {
      yield detachedFunction;
      yield* detachedFunction.nestedElements();
    }
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
