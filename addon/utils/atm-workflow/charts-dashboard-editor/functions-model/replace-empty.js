/**
 * Model of `replaceEmpty` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, set } from '@ember/object';
import { ReplaceEmptyStrategy } from 'onedata-gui-common/utils/time-series-dashboard';
import { FunctionDataType } from './common';
import FunctionBase from './function-base';

const dataArgument = Object.freeze({
  name: 'data',
  compatibleTypes: [FunctionDataType.Points, FunctionDataType.Number],
});

const ReplaceEmptyFunction = FunctionBase.extend({
  /**
   * @public
   * @type {FunctionBase | null}
   */
  data: null,

  /**
   * @public
   * @type {ReplaceEmptyStrategy}
   */
  strategy: ReplaceEmptyStrategy.UseFallback,

  /**
   * @public
   * @type {number | null}
   */
  fallbackValue: 0,

  /**
   * @override
   */
  name: 'replaceEmpty',

  /**
   * @override
   */
  hasSettingsComponent: true,

  /**
   * @override
   */
  attachableArgumentSpecs: Object.freeze([dataArgument]),

  /**
   * @override
   */
  returnedTypes: computed('data.returnedTypes', function returnedTypes() {
    return this.data?.returnedTypes ?? dataArgument.compatibleTypes;
  }),
});

/**
 * @param {unknown} spec
 * @param {Partial<FunctionBase>} fieldsToInject
 * @param {(spec: unknown) => FunctionBase} convertAnySpecToFunction
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.ReplaceEmpty}
 */
function createFromSpec(spec, fieldsToInject, convertAnySpecToFunction) {
  const funcElement = ReplaceEmptyFunction.create({
    ...fieldsToInject,
    strategy: convertAnySpecToFunction(spec.functionArguments?.strategyProvider) ??
      ReplaceEmptyStrategy.UseFallback,
    replaceEmptyParameters: EmberObject.create({
      data: convertAnySpecToFunction(spec.functionArguments?.dataProvider),
      // We assume here, that strategy and fallbackValue are always provided
      // by "literal" function. There is no other (sensible) function, which could be
      // used in this context.
      strategy: spec.functionArguments?.strategyProvider?.functionArguments?.data,
      fallbackValue: spec.functionArguments?.fallbackValueProvider
        ?.functionArguments?.data,
    }),
  });
  if (funcElement.data) {
    set(funcElement.data, 'parentElement', funcElement);
  }
  return funcElement;
}

/**
 * @type {FunctionSpec<ReplaceEmptyFunction>}
 */
export default Object.freeze({
  name: 'replaceEmpty',
  returnedTypes: [FunctionDataType.Points, FunctionDataType.Number],
  modelClass: ReplaceEmptyFunction,
  createFromSpec,
});
