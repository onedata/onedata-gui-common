/**
 * Model of `loadSeries` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
   * @virtual optional
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
  returnedTypes: Object.freeze([FunctionDataType.Points]),

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
 * @type {FunctionSpec<LoadSeriesFunction>}
 */
export default Object.freeze({
  name: 'loadSeries',
  returnedTypes: [FunctionDataType.Points],
  allowedContexts: [
    FunctionExecutionContext.Series,
    FunctionExecutionContext.RepeatedSeries,
  ],
  modelClass: LoadSeriesFunction,
});
