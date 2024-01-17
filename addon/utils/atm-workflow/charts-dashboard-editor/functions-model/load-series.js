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
   * @type {EmberObject<TimeSeriesRef>}
   */
  timeSeriesRef: undefined,

  /**
   * @public
   * @virtual optional
   * @type {EmberObject<ReplaceEmptyParameters> | null}
   */
  replaceEmptyParameters: null,

  /**
   * @override
   */
  name: 'loadSeries',

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
        fallbackValue: 0,
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
  clone() {
    return LoadSeriesFunction.create({
      dataSources: this.dataSources,
      timeSeriesRef: EmberObject.create(this.timeSeriesRef),
      replaceEmptyParameters: this.replaceEmptyParameters ?
        EmberObject.create(this.replaceEmptyParameters) : null,
      positionRelativeToRootFunc: this.positionRelativeToRootFunc,
      parent: this.parent,
    });
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
                collectionRef: this.timeSeriesRef.collectionRef ??
                  this.defaultDataSource?.collectionRef,
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
      strategy: replaceEmptyRawArgs?.strategyProvider?.functionArguments?.data ??
        ReplaceEmptyStrategy.UseFallback,
      fallbackValue: replaceEmptyRawArgs?.fallbackValueProvider
        ?.functionArguments?.data ?? null,
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
  modelClass: LoadSeriesFunction,
  createFromSpec,
});