/**
 * Model of `rate` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, set } from '@ember/object';
import { FunctionDataType } from './common';
import FunctionBase from './function-base';

const dataArgument = Object.freeze({
  name: 'data',
  compatibleTypes: [FunctionDataType.Points, FunctionDataType.Number],
});
const attachableArgumentSpecs = Object.freeze([dataArgument]);

const RateFunction = FunctionBase.extend({
  /**
   * @public
   * @type {FunctionBase | null}
   */
  data: null,

  /**
   * @public
   * @type {number | null}
   */
  timeSpan: 1,

  /**
   * @override
   */
  name: 'rate',

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
  functionSpecificValidationErrors: computed(
    'timeSpan',
    function functionSpecificValidationErrors() {
      if (!this.timeSpan || this.timeSpan < 0) {
        return [{
          errorId: 'chartFunctionParameterInvalid',
          errorDetails: {
            parameterName: 'timeSpan',
          },
          element: this,
        }];
      }

      return [];
    }
  ),

  /**
   * @override
   */
  clone() {
    const functionClone = RateFunction.create({
      dataSources: this.dataSources,
      data: this.data?.clone(),
      timeSpan: this.timeSpan,
      positionRelativeToRootFunc: this.positionRelativeToRootFunc,
      parent: this.parent,
    });

    if (functionClone.data) {
      set(functionClone.data, 'parent', functionClone);
    }

    return functionClone;
  },

  /**
   * @override
   */
  toJson() {
    const functionJson = {
      functionName: 'rate',
      functionArguments: {
        inputDataProvider: this.data?.toJson() ?? null,
      },
    };

    if (this.timeSpan) {
      functionJson.functionArguments.timeSpanProvider = {
        functionName: 'literal',
        functionArguments: {
          data: this.timeSpan,
        },
      };
    }

    return functionJson;
  },
});

/**
 * @param {unknown} spec
 * @param {Partial<FunctionBase>} fieldsToInject
 * @param {(spec: unknown) => FunctionBase} convertAnySpecToFunction
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.Rate}
 */
function createFromSpec(spec, fieldsToInject, convertAnySpecToFunction) {
  const timeSpanProvider = spec.functionArguments.timeSpanProvider;
  const timeSpan = timeSpanProvider?.functionName === 'literal' ?
    timeSpanProvider.functionArguments.data : 1;
  const funcElement = RateFunction.create({
    ...fieldsToInject,
    data: convertAnySpecToFunction(spec.functionArguments?.inputDataProvider),
    timeSpan,
  });
  if (funcElement.data) {
    set(funcElement.data, 'parent', funcElement);
  }
  return funcElement;
}

/**
 * @type {FunctionSpec<RateFunction>}
 */
export default Object.freeze({
  name: 'rate',
  attachableArgumentSpecs,
  returnedTypes: [FunctionDataType.Points, FunctionDataType.Number],
  modelClass: RateFunction,
  createFromSpec,
});
