/**
 * Model of `replaceEmpty` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, set } from '@ember/object';
import { ReplaceEmptyStrategy } from 'onedata-gui-common/utils/time-series-dashboard';
import { FunctionDataType } from './common';
import FunctionBase from './function-base';

const dataArgument = Object.freeze({
  name: 'data',
  compatibleTypes: [FunctionDataType.Points, FunctionDataType.Number],
});
const attachableArgumentSpecs = Object.freeze([dataArgument]);

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
  attachableArgumentSpecs,

  /**
   * @override
   */
  returnedTypes: computed('data.returnedTypes', function returnedTypes() {
    return this.data?.returnedTypes ?? dataArgument.compatibleTypes;
  }),

  /**
   * @override
   */
  toJson() {
    return {
      functionName: 'replaceEmpty',
      functionArguments: {
        inputDataProvider: this.data?.toJson() ?? null,
        strategyProvider: {
          functionName: 'literal',
          functionArguments: {
            data: this.strategy,
          },
        },
        fallbackValueProvider: {
          functionName: 'literal',
          functionArguments: {
            data: this.fallbackValue,
          },
        },
      },
    };
  },
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
    data: convertAnySpecToFunction(spec.functionArguments?.inputDataProvider),
    // We assume here, that strategy and fallbackValue are always provided
    // by "literal" function. There is no other (sensible) function, which could be
    // used in this context.
    strategy: spec.functionArguments?.strategyProvider?.functionArguments?.data ??
      ReplaceEmptyStrategy.UseFallback,
    fallbackValue: spec.functionArguments?.fallbackValueProvider
      ?.functionArguments?.data,
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
  attachableArgumentSpecs,
  returnedTypes: [FunctionDataType.Points, FunctionDataType.Number],
  modelClass: ReplaceEmptyFunction,
  createFromSpec,
});
