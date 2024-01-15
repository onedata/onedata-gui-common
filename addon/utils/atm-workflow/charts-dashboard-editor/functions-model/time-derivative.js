/**
 * Model of `timeDerivative` chart function.
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

const TimeDerivativeFunction = FunctionBase.extend({
  /**
   * @public
   * @type {FunctionBase | null}
   */
  data: null,

  /**
   * @public
   * @type {number | null}
   */
  timeSpan: null,

  /**
   * @override
   */
  name: 'timeDerivative',

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
  clone() {
    const functionClone = TimeDerivativeFunction.create({
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
      functionName: 'timeDerivative',
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
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.TimeDerivative}
 */
function createFromSpec(spec, fieldsToInject, convertAnySpecToFunction) {
  const timeSpanProvider = spec.functionArguments.timeSpanProvider;
  const timeSpan = timeSpanProvider?.functionName === 'literal' ?
    timeSpanProvider.functionArguments.data : null;
  const funcElement = TimeDerivativeFunction.create({
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
 * @type {FunctionSpec<TimeDerivativeFunction>}
 */
export default Object.freeze({
  name: 'timeDerivative',
  attachableArgumentSpecs,
  returnedTypes: [FunctionDataType.Points, FunctionDataType.Number],
  modelClass: TimeDerivativeFunction,
  createFromSpec,
});
