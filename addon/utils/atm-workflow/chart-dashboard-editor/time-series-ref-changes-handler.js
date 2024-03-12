/**
 * Utility class responsible for remembering changes in time series reference
 * inside passed object. It allows to restore previous timeSeriesName and
 * metricNames when user changes collection or generator.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { observer, set, setProperties } from '@ember/object';
import { getBy } from 'ember-awesome-macros';
import _ from 'lodash';

const fieldsToMonitor = Object.freeze([
  'collectionRef',
  'timeSeriesNameGenerator',
  'timeSeriesName',
  'metricNames',
]);

export default EmberObject.extend({
  /**
   * @virtual
   * @type {EmberObject}
   */
  timeSeriesRefContainer: undefined,

  /**
   * @virtual optional
   * @type {string}
   */
  timeSeriesRefFieldName: 'timeSeriesRef',

  /**
   * @virtual optional
   * @type {string}
   */
  dataSourcesFieldName: 'dataSources',

  /**
   * @virtual optional
   * @type {boolean}
   */
  ignoreTimeSeriesName: false,

  /**
   * Map collectionRef -> { lastTimeSeriesNameGenerator: string, timeSeriesNameGenerators: { timeSeriesName, metricNames }}.
   * Contains user input for given collection/generator pair. Allows to restore
   * previous timeSeriesName and metricNames when user changes collection or generator.
   * @type {Object<string, Object<{lastTimeSeriesNameGenerator: string, timeSeriesNameGenerators: { timeSeriesName: string, metricNames: Array<string> }>>}
   */
  historicalTimeSeriesRefs: undefined,

  /**
   * @type {EmberObject<unknown> | null}
   */
  previousTimeSeriesRef: null,

  /**
   * @type {ComputedProperty<EmberObject<TimeSeriesRef>>}
   */
  timeSeriesRef: getBy('timeSeriesRefContainer', 'timeSeriesRefFieldName'),

  /**
   * @type {ComputedProperty<Array<ChartDashboardEditorDataSource>}
   */
  dataSources: getBy('timeSeriesRefContainer', 'dataSourcesFieldName'),

  timeSeriesRefObserver: observer('timeSeriesRef', function timeSeriesRefObserver() {
    if (this.previousTimeSeriesRef === this.timeSeriesRef) {
      return;
    }

    if (this.previousTimeSeriesRef) {
      this.removeObserversFromTimeSeriesRef(this.previousTimeSeriesRef);
      this.previousTimeSeriesRef.destroy();
    }
    this.set('previousTimeSeriesRef', this.timeSeriesRef);

    if (this.timeSeriesRef) {
      this.addObserversToTimeSeriesRef(this.timeSeriesRef);
      const {
        collectionRef,
        timeSeriesNameGenerator,
        timeSeriesName,
        metricNames,
      } = (this.timeSeriesRef ?? {});
      if (collectionRef) {
        const collectionRefHistory =
          this.historicalTimeSeriesRefs[collectionRef] ??= {
            timeSeriesNameGenerators: {},
          };
        collectionRefHistory.lastTimeSeriesNameGenerator =
          timeSeriesNameGenerator;
        if (timeSeriesNameGenerator) {
          collectionRefHistory.timeSeriesNameGenerators[timeSeriesNameGenerator] = {
            metricNames: metricNames,
          };
          if (!this.ignoreTimeSeriesName) {
            collectionRefHistory
              .timeSeriesNameGenerators[timeSeriesNameGenerator].timeSeriesName =
              timeSeriesName;
          }
        }
      }
    }
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('historicalTimeSeriesRefs', {});
    this.timeSeriesRefObserver();
  },

  handleCollectionRefChange() {
    const collectionRef = this.timeSeriesRef.collectionRef;
    this.historicalTimeSeriesRefs[collectionRef] ??= {
      lastTimeSeriesNameGenerator: '',
      timeSeriesNameGenerators: {},
    };
    set(
      this.timeSeriesRefContainer[this.timeSeriesRefFieldName],
      'timeSeriesNameGenerator',
      this.historicalTimeSeriesRefs[collectionRef].lastTimeSeriesNameGenerator
    );
  },

  handleTimeSeriesNameGeneratorChange() {
    const collectionRef = this.timeSeriesRef.collectionRef;
    const collectionRefHistory = this.historicalTimeSeriesRefs[collectionRef];
    const timeSeriesNameGenerator =
      this.timeSeriesRef.timeSeriesNameGenerator;
    if (!collectionRefHistory) {
      return;
    }
    collectionRefHistory.lastTimeSeriesNameGenerator =
      timeSeriesNameGenerator;
    if (timeSeriesNameGenerator) {
      if (this.ignoreTimeSeriesName) {
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
      this.timeSeriesRefContainer[this.timeSeriesRefFieldName],
      collectionRefHistory.timeSeriesNameGenerators[timeSeriesNameGenerator] ?? {
        ...(this.ignoreTimeSeriesName ? {} : { timeSeriesName: '' }),
        metricNames: [],
      }
    );
  },

  handleTimeSeriesNameChange() {
    if (this.ignoreTimeSeriesName) {
      return;
    }

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

  /**
   * Attaches observers to the timeSeriesRef itself, to allow replacing
   * the whole `timeSeriesRef` object without firing them.
   * @param {EmberObject} timeSeriesRef
   */
  addObserversToTimeSeriesRef(timeSeriesRef) {
    let fieldsToMonitorHere = fieldsToMonitor;
    if (!this.ignoreTimeSeriesName) {
      fieldsToMonitorHere = fieldsToMonitorHere.filter((field) =>
        field !== 'timeSeriesName'
      );
    }

    fieldsToMonitorHere.forEach((fieldName) => {
      timeSeriesRef.addObserver(
        fieldName,
        this,
        `handle${_.upperFirst(fieldName)}Change`
      );
    });
  },

  /**
   * @param {EmberObject} timeSeriesRef
   */
  removeObserversFromTimeSeriesRef(timeSeriesRef) {
    fieldsToMonitor.forEach((fieldName) => {
      timeSeriesRef.removeObserver(
        fieldName,
        this,
        `handle${_.upperFirst(fieldName)}Change`
      );
    });
  },
});
