/**
 * Model of `loadSeries` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { observer, set, setProperties } from '@ember/object';
import { ReplaceEmptyStrategy } from 'onedata-gui-common/utils/time-series-dashboard';
import { FunctionDataType, FunctionExecutionContext } from './common';
import FunctionBase from './function-base';

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
   * Map collectionRef -> { lastTimeSeriesNameGenerator: string, timeSeriesNameGenerators: { timeSeriesName, metricNames }}.
   * Contains user input for given collection/generator pair. Allows to restore
   * previous timeSeriesName and metricNames when user changes collection or generator.
   * @type {Object<string, Object<{lastTimeSeriesNameGenerator: string, timeSeriesNameGenerators: { timeSeriesName: string, metricNames: Array<string> }>>}
   */
  historicalTimeSeriesRefs: undefined,

  /**
   * @type {EmberObject<TimeSeriesRef> | null}
   */
  prevTimeSeriesRef: null,

  timeSeriesRefObserver: observer(
    'timeSeriesRef',
    function timeSeriesRefObserver() {
      if (this.prevTimeSeriesRef === this.timeSeriesRef) {
        return;
      }

      // Attaching observers to the timeSeriesRef itself, to allows replacing
      // the whole `timeSeriesRef` object without fireing them.
      if (this.prevTimeSeriesRef) {
        this.prevTimeSeriesRef.removeObserver(
          'collectionRef',
          this,
          'handleCollectionRefChange'
        );
        this.prevTimeSeriesRef.removeObserver(
          'timeSeriesNameGenerator',
          this,
          'handleTimeSeriesNameGeneratorChange'
        );
        this.prevTimeSeriesRef.removeObserver(
          'timeSeriesName',
          this,
          'handleTimeSeriesNameChange'
        );
        this.prevTimeSeriesRef.removeObserver(
          'metricNames',
          this,
          'handleMetricNamesChange'
        );
        this.prevTimeSeriesRef.destroy();
      }
      this.set('prevTimeSeriesRef', this.timeSeriesRef);

      if (this.timeSeriesRef) {
        this.timeSeriesRef.addObserver(
          'collectionRef',
          this,
          'handleCollectionRefChange'
        );
        this.timeSeriesRef.addObserver(
          'timeSeriesNameGenerator',
          this,
          'handleTimeSeriesNameGeneratorChange'
        );
        this.timeSeriesRef.addObserver(
          'timeSeriesName',
          this,
          'handleTimeSeriesNameChange'
        );
        this.timeSeriesRef.addObserver(
          'metricNames',
          this,
          'handleMetricNamesChange'
        );

        const {
          collectionRef,
          timeSeriesNameGenerator,
          timeSeriesName,
          metricNames,
        } = (this.timeSeriesRef ?? {});
        if (collectionRef) {
          const collectionRefHistory =
            this.historicalTimeSeriesRefs[collectionRef] ??= {};
          collectionRefHistory.lastTimeSeriesNameGenerator =
            timeSeriesNameGenerator;
          if (timeSeriesNameGenerator) {
            collectionRefHistory[timeSeriesNameGenerator] = {
              timeSeriesName: timeSeriesName,
              metricNames: metricNames,
            };
          }
        }
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.set('historicalTimeSeriesRefs', {});
    if (!this.timeSeriesRef) {
      this.set('timeSeriesRef', EmberObject.create({
        collectionRef: '',
        timeSeriesNameGenerator: '',
        timeSeriesName: '',
        metricNames: [],
      }));
    }
    this.timeSeriesRefObserver();
    if (!this.replaceEmptyParameters) {
      this.set('replaceEmptyParameters', EmberObject.create({
        fallbackValue: null,
        strategy: ReplaceEmptyStrategy.UseFallback,
      }));
    }
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
    } finally {
      this._super(...arguments);
    }
  },

  handleCollectionRefChange() {
    const collectionRef = this.timeSeriesRef.collectionRef;
    this.historicalTimeSeriesRefs[collectionRef] ??= {
      lastTimeSeriesNameGenerator: '',
      timeSeriesNameGenerators: {},
    };
    set(
      this.timeSeriesRef,
      'timeSeriesNameGenerator',
      this.historicalTimeSeriesRefs[collectionRef].lastTimeSeriesNameGenerator
    );
  },

  handleTimeSeriesNameGeneratorChange() {
    const collectionRef = this.timeSeriesRef.collectionRef;
    const collectionRefHistory = this.historicalTimeSeriesRefs[collectionRef];
    const timeSeriesNameGenerator = this.timeSeriesRef.timeSeriesNameGenerator;
    if (!collectionRefHistory) {
      return;
    }
    collectionRefHistory.lastTimeSeriesNameGenerator =
      timeSeriesNameGenerator;
    if (timeSeriesNameGenerator) {
      const timeSeriesSchemas = this.dataSources.find((source) =>
        source.collectionRef === collectionRef
      )?.timeSeriesCollectionSchema.timeSeriesSchemas ?? [];
      const timeSeriesNameGeneratorSpec = timeSeriesSchemas.find(({ nameGenerator }) =>
        nameGenerator === timeSeriesNameGenerator
      );
      const defaultTimeSeriesName =
        timeSeriesNameGeneratorSpec?.nameGeneratorType === 'exact' ?
        timeSeriesNameGenerator : '';
      collectionRefHistory.timeSeriesNameGenerators[timeSeriesNameGenerator] ??= {
        timeSeriesName: defaultTimeSeriesName,
        metricNames: [],
      };
    }
    setProperties(
      this.timeSeriesRef,
      collectionRefHistory.timeSeriesNameGenerators[timeSeriesNameGenerator] ?? {
        timeSeriesName: '',
        metricNames: [],
      }
    );
  },

  handleTimeSeriesNameChange() {
    const generatorHistory =
      this.historicalTimeSeriesRefs[this.timeSeriesRef.collectionRef]
      ?.timeSeriesNameGenerators[this.timeSeriesRef.timeSeriesNameGenerator];
    if (generatorHistory) {
      generatorHistory.timeSeriesName = this.timeSeriesRef.timeSeriesName;
    }
  },

  handleMetricNamesChange() {
    const generatorHistory =
      this.historicalTimeSeriesRefs[this.timeSeriesRef.collectionRef]
      ?.timeSeriesNameGenerators[this.timeSeriesRef.timeSeriesNameGenerator];
    if (generatorHistory) {
      generatorHistory.metricNames = this.timeSeriesRef.metricNames;
    }
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
      // We assume here, that strategy and falllbackValue are always provided
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
  returnedTypes: [FunctionDataType.Points],
  allowedContexts: [
    FunctionExecutionContext.Series,
    FunctionExecutionContext.RepeatedSeries,
  ],
  needsDataSources: true,
  modelClass: LoadSeriesFunction,
  createFromSpec,
});
