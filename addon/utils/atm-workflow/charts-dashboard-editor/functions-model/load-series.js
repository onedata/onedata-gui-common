/**
 * Model of `loadSeries` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { ReplaceEmptyStrategy } from 'onedata-gui-common/utils/time-series-dashboard';
import { FunctionDataType, FunctionExecutionContext } from './common';
import FunctionBase from './function-base';
import TimeSeriesRefChangesHandler from '../time-series-ref-changes-handler';

/**
 * @typedef {Object} TimeSeriesRef
 * @property {string | null} collectionRef
 * @property {string} timeSeriesNameGenerator
 * @property {string} timeSeriesName
 * @property {Array<string>} metricNames
 */

/**
 * @typedef {Object} ReplaceEmptyParameters
 * @property {ReplaceEmptyStrategy} strategy
 * @property {number | null} fallbackValue
 */

const LoadSeriesFunction = FunctionBase.extend({
  /**
   * @public
   * @virtual
   * @type {Array<ChartsDashboardEditorDataSource>}
   */
  dataSources: undefined,

  /**
   * @public
   * @virtual optional
   * @type {EmberObject<TimeSeriesRef>}
   */
  timeSeriesRef: undefined,

  /**
   * @public
   * @virtual optional
   * @type {EmberObject<ReplaceEmptyParameters>}
   */
  replaceEmptyParameters: null,

  /**
   * @override
   */
  name: 'loadSeries',

  /**
   * @override
   */
  needsDataSources: true,

  /**
   * @override
   */
  hasSettingsComponent: true,

  /**
   * @override
   */
  returnedTypes: Object.freeze([FunctionDataType.Points]),

  /**
   * Set in `init`.
   * @type {TimeSeriesRefChangesHandler}
   */
  timeSeriesRefChangesHandler: undefined,

  init() {
    this._super(...arguments);

    if (!this.timeSeriesRef) {
      this.set('timeSeriesRef', EmberObject.create({
        collectionRef: '',
        timeSeriesNameGenerator: '',
        timeSeriesName: '',
        metricNames: [],
      }));
    }

    if (!this.replaceEmptyParameters) {
      this.set('replaceEmptyParameters', EmberObject.create({
        fallbackValue: null,
        strategy: ReplaceEmptyStrategy.UseFallback,
      }));
    }

    this.set('timeSeriesRefChangesHandler', TimeSeriesRefChangesHandler.create({
      timeSeriesRefContainer: this,
    }));
  },

  willDestroy() {
    try {
      if (this.timeSeriesRef) {
        this.timeSeriesRef.destroy();
        this.set('timeSeriesRef', undefined);
      }
      if (this.replaceEmptyParameters) {
        this.replaceEmptyParameters.destroy();
        this.set('replaceEmptyParameters', null);
      }
      if (this.timeSeriesRefChangesHandler) {
        this.timeSeriesRefChangesHandler.destroy();
        this.set('replaceEmptyParameters', undefined);
      }
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  toJson() {
    return {
      functionName: 'loadSeries',
      functionArguments: {
        sourceType: 'external',
        sourceSpecProvider: {
          functionName: 'literal',
          functionArguments: {
            data: {
              externalSourceName: 'store',
              externalSourceParameters: {
                collectionRef: this.timeSeriesRef.collectionRef,
                timeSeriesNameGenerator: this.timeSeriesRef.timeSeriesNameGenerator,
                timeSeriesName: this.timeSeriesRef.timeSeriesName,
                metricNames: this.timeSeriesRef.metricNames,
              },
            },
          },
        },
        replaceEmptyParametersProvider: {
          functionName: 'literal',
          functionArguments: {
            data: {
              strategyProvider: {
                functionName: 'literal',
                functionArguments: {
                  data: this.replaceEmptyParameters.strategy ??
                    ReplaceEmptyStrategy.UseFallback,
                },
              },
              fallbackValueProvider: {
                functionName: 'literal',
                functionArguments: {
                  data: this.replaceEmptyParameters.fallbackValue ?? null,
                },
              },
            },
          },
        },
      },
    };
  },
});

/**
 * @param {unknown} spec
 * @param {Partial<FunctionBase>} fieldsToInject
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.LoadSeries}
 */
function createFromSpec(spec, fieldsToInject) {
  // We assume here, that sourceSpec and replaceEmptyParameters are always provided
  // by "literal" function. There is no other (sensible) function, which could be
  // used in this context.
  const externalSourceParameters = spec.functionArguments?.sourceSpecProvider
    ?.functionArguments?.data?.externalSourceParameters;
  const replaceEmptyRawArgs = spec.functionArguments
    ?.replaceEmptyParametersProvider?.functionArguments?.data;

  const funcElement = LoadSeriesFunction.create({
    ...fieldsToInject,
    timeSeriesRef: EmberObject.create(externalSourceParameters ?? {}),
    replaceEmptyParameters: EmberObject.create({
      // We assume here, that strategy and fallbackValue are always provided
      // by "literal" function. There is no other (sensible) function, which could be
      // used in this context.
      strategy: replaceEmptyRawArgs?.strategyProvider?.functionArguments?.data,
      fallbackValue: replaceEmptyRawArgs?.fallbackValueProvider?.functionArguments?.data,
    }),
  });
  return funcElement;
}

/**
 * @type {FunctionSpec<LoadSeriesFunction>}
 */
export default Object.freeze({
  name: 'loadSeries',
  attachableArgumentSpecs: [],
  returnedTypes: [FunctionDataType.Points],
  allowedContexts: [
    FunctionExecutionContext.Series,
    FunctionExecutionContext.RepeatedSeries,
  ],
  needsDataSources: true,
  modelClass: LoadSeriesFunction,
  createFromSpec,
});
