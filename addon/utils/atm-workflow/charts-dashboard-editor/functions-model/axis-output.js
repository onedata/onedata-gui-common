/**
 * Model of a special `axisOutput` chart function which simulates the last
 * "output" axis function (so the result value ready to render on the axis).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set } from '@ember/object';
import { FunctionDataType, FunctionExecutionContext } from './common';
import FunctionBase from './function-base';

const dataArgument = Object.freeze({
  name: 'data',
  compatibleTypes: [FunctionDataType.Number],
});

const AxisOutputFunction = FunctionBase.extend({
  /**
   * @public
   * @type {FunctionBase | null}
   */
  data: null,

  /**
   * @override
   */
  name: 'axisOutput',

  /**
   * @override
   */
  attachableArgumentSpecs: Object.freeze([dataArgument]),

  /**
   * @override
   */
  returnedTypes: Object.freeze([FunctionDataType.Number]),
});

/**
 * @param {unknown} spec
 * @param {Partial<FunctionBase>} fieldsToInject
 * @param {(spec: unknown) => FunctionBase} convertAnySpecToFunction
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.AxisOutput}
 */
function createFromSpec(spec, fieldsToInject, convertAnySpecToFunction) {
  const funcElement = AxisOutputFunction.create({
    ...fieldsToInject,
    data: convertAnySpecToFunction(spec),
  });
  if (funcElement.data) {
    set(funcElement.data, 'parentElement', funcElement);
  }
  return funcElement;
}

/**
 * @type {FunctionSpec<AxisOutputFunction>}
 */
export default Object.freeze({
  name: 'axisOutput',
  returnedTypes: [FunctionDataType.Number],
  isNotAvailableForUser: true,
  allowedContexts: [FunctionExecutionContext.Axis],
  modelClass: AxisOutputFunction,
  createFromSpec,
});
