/**
 * Model of `loadSeries` chart function variant, which loads series according to
 * dynamic series config (so it is a "repeated" series).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { FunctionDataType, FunctionExecutionContext } from './common';
import FunctionBase from './function-base';

const LoadRepeatedSeriesFunction = FunctionBase.extend({
  /**
   * @public
   * @virtual optional
   * @type {EmberObject<ReplaceEmptyParameters> | null}
   */
  replaceEmptyParameters: null,

  /**
   * @override
   */
  name: 'loadRepeatedSeries',

  /**
   * @override
   */
  hasSettingsComponent: true,

  /**
   * @override
   */
  returnedTypes: Object.freeze([FunctionDataType.Points]),

  /**
   * @override
   */
  willDestroy() {
    try {
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
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.LoadRepeatedSeries}
 */
function createFromSpec(spec, fieldsToInject) {
  const replaceEmptyRawArgs = spec.functionArguments
    ?.replaceEmptyParametersProvider?.functionArguments;

  const funcElement = LoadRepeatedSeriesFunction.create({
    ...fieldsToInject,
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
 * @type {FunctionSpec<LoadRepeatedSeriesFunction>}
 */
export default Object.freeze({
  name: 'loadRepeatedSeries',
  returnedTypes: [FunctionDataType.Points],
  allowedContexts: [FunctionExecutionContext.RepeatedSeries],
  modelClass: LoadRepeatedSeriesFunction,
  createFromSpec,
});
