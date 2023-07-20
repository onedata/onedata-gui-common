/**
 * Model of `loadSeries` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { observer, set, setProperties } from '@ember/object';
import Mixin from '@ember/object/mixin';
import _ from 'lodash';
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

const LoadSeriesFunction = FunctionBase.extend(createTimeSeriesRefChangesHandler('timeSeriesRef'), {
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

  init() {
    // Setting timeSeriesRef before _super call, to provide a ready to use value
    // for mixins.
    if (!this.timeSeriesRef) {
      this.set('timeSeriesRef', EmberObject.create({
        collectionRef: '',
        timeSeriesNameGenerator: '',
        timeSeriesName: '',
        metricNames: [],
      }));
    }

    this._super(...arguments);

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

/**
 * @param {string} timeSeriesRefFieldName
 * @param {boolean} [ignoreTimeSeriesName]
 * @returns {Ember.Mixin}
 */
export function createTimeSeriesRefChangesHandler(
  timeSeriesRefFieldName,
  ignoreTimeSeriesName = false,
) {
  const historicalRefsFieldName = `historical${_.upperFirst(timeSeriesRefFieldName)}`;
  const prevRefFieldName = `prev${_.upperFirst(timeSeriesRefFieldName)}`;
  const replaceObserverName = `${timeSeriesRefFieldName}Observer`;

  return Mixin.create({
    /**
     * Map collectionRef -> { lastTimeSeriesNameGenerator: string, timeSeriesNameGenerators: { timeSeriesName, metricNames }}.
     * Contains user input for given collection/generator pair. Allows to restore
     * previous timeSeriesName and metricNames when user changes collection or generator.
     * @type {Object<string, Object<{lastTimeSeriesNameGenerator: string, timeSeriesNameGenerators: { timeSeriesName: string, metricNames: Array<string> }>>}
     */
    [historicalRefsFieldName]: undefined,

    /**
     * @type {EmberObject<unknown> | null}
     */
    [prevRefFieldName]: null,

    [replaceObserverName]: observer(
      timeSeriesRefFieldName,
      function timeSeriesRefObserver() {
        if (this[prevRefFieldName] === this[timeSeriesRefFieldName]) {
          return;
        }

        const fieldsToMonitor = ['collectionRef', 'timeSeriesNameGenerator', 'metricNames'];
        if (!ignoreTimeSeriesName) {
          fieldsToMonitor.push('timeSeriesName');
        }

        // Attaching observers to the timeSeriesRef itself, to allow replacing
        // the whole `timeSeriesRef` object without firing them.
        if (this[prevRefFieldName]) {
          fieldsToMonitor.forEach((fieldName) => {
            this[prevRefFieldName].removeObserver(
              fieldName,
              this,
              `handle${_.upperFirst(fieldName)}Change`
            );
          });
          this[prevRefFieldName].destroy();
        }
        this.set(prevRefFieldName, this[timeSeriesRefFieldName]);

        if (this[timeSeriesRefFieldName]) {
          fieldsToMonitor.forEach((fieldName) => {
            this[timeSeriesRefFieldName].addObserver(
              fieldName,
              this,
              `handle${_.upperFirst(fieldName)}Change`
            );
          });

          const {
            collectionRef,
            timeSeriesNameGenerator,
            timeSeriesName,
            metricNames,
          } = (this[timeSeriesRefFieldName] ?? {});
          if (collectionRef) {
            const collectionRefHistory =
              this[historicalRefsFieldName][collectionRef] ??= {};
            collectionRefHistory.lastTimeSeriesNameGenerator =
              timeSeriesNameGenerator;
            if (timeSeriesNameGenerator) {
              collectionRefHistory[timeSeriesNameGenerator] = {
                metricNames: metricNames,
              };
              if (!ignoreTimeSeriesName) {
                collectionRefHistory[timeSeriesNameGenerator].timeSeriesName =
                  timeSeriesName;
              }
            }
          }
        }
      }
    ),

    init() {
      this._super(...arguments);
      this.set(historicalRefsFieldName, {});
      this[replaceObserverName]();
    },

    handleCollectionRefChange() {
      const collectionRef = this[timeSeriesRefFieldName].collectionRef;
      this[historicalRefsFieldName][collectionRef] ??= {
        lastTimeSeriesNameGenerator: '',
        timeSeriesNameGenerators: {},
      };
      set(
        this[timeSeriesRefFieldName],
        'timeSeriesNameGenerator',
        this[historicalRefsFieldName][collectionRef].lastTimeSeriesNameGenerator
      );
    },

    handleTimeSeriesNameGeneratorChange() {
      const collectionRef = this[timeSeriesRefFieldName].collectionRef;
      const collectionRefHistory = this[historicalRefsFieldName][collectionRef];
      const timeSeriesNameGenerator =
        this[timeSeriesRefFieldName].timeSeriesNameGenerator;
      if (!collectionRefHistory) {
        return;
      }
      collectionRefHistory.lastTimeSeriesNameGenerator =
        timeSeriesNameGenerator;
      if (timeSeriesNameGenerator) {
        if (ignoreTimeSeriesName) {
          collectionRefHistory.timeSeriesNameGenerators[timeSeriesNameGenerator] ??= {
            metricNames: [],
          };
        } else {
          const timeSeriesSchemas = this.dataSources.find((source) =>
            source.collectionRef === collectionRef
          )?.timeSeriesCollectionSchema.timeSeriesSchemas ?? [];
          const timeSeriesNameGeneratorSpec = timeSeriesSchemas
            .find(({ nameGenerator }) =>
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
      }
      setProperties(
        this[timeSeriesRefFieldName],
        collectionRefHistory.timeSeriesNameGenerators[timeSeriesNameGenerator] ?? {
          ...(ignoreTimeSeriesName ? {} : { timeSeriesName: '' }),
          metricNames: [],
        }
      );
    },

    handleTimeSeriesNameChange() {
      if (ignoreTimeSeriesName) {
        return;
      }

      const generatorHistory =
        this[historicalRefsFieldName][this[timeSeriesRefFieldName].collectionRef]
        ?.timeSeriesNameGenerators[this[timeSeriesRefFieldName].timeSeriesNameGenerator];
      if (generatorHistory) {
        generatorHistory.timeSeriesName = this[timeSeriesRefFieldName].timeSeriesName;
      }
    },

    handleMetricNamesChange() {
      const generatorHistory =
        this[historicalRefsFieldName][this[timeSeriesRefFieldName].collectionRef]
        ?.timeSeriesNameGenerators[this[timeSeriesRefFieldName].timeSeriesNameGenerator];
      if (generatorHistory) {
        generatorHistory.metricNames = this[timeSeriesRefFieldName].metricNames;
      }
    },
  });
}
