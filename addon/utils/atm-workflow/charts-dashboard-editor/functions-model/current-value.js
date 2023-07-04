/**
 * Model of `currentValue` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { FunctionDataType, FunctionExecutionContext } from './common';
import FunctionBase from './function-base';

const CurrentValueFunction = FunctionBase.extend({
  /**
   * @override
   */
  name: 'currentValue',

  /**
   * @override
   */
  returnedTypes: Object.freeze([FunctionDataType.Number]),
});

/**
 * @param {unknown} spec
 * @param {Partial<FunctionBase>} fieldsToInject
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.CurrentValueFunction}
 */
function createFromSpec(spec, fieldsToInject) {
  return CurrentValueFunction.create(fieldsToInject);
}

/**
 * @type {FunctionSpec<CurrentValueFunction>}
 */
export default Object.freeze({
  name: 'currentValue',
  returnedTypes: [FunctionDataType.Number],
  allowedContexts: [FunctionExecutionContext.Axis],
  modelClass: CurrentValueFunction,
  createFromSpec,
});
