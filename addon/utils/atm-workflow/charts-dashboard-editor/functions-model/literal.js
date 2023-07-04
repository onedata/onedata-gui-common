/**
 * Model of `literal` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { FunctionDataType } from './common';
import FunctionBase from './function-base';

const LiteralFunction = FunctionBase.extend({
  /**
   * @public
   * @type {number | null}
   */
  data: null,

  /**
   * @override
   */
  name: 'literal',

  /**
   * @override
   */
  hasSettingsComponent: true,

  /**
   * @override
   */
  returnedTypes: Object.freeze([FunctionDataType.Number]),
});

/**
 * @param {unknown} spec
 * @param {Partial<FunctionBase>} fieldsToInject
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.LiteralFunction}
 */
function createFromSpec(spec, fieldsToInject) {
  return LiteralFunction.create({
    ...fieldsToInject,
    data: spec.functionArguments?.data,
  });
}

/**
 * @type {FunctionSpec<LiteralFunction>}
 */
export default Object.freeze({
  name: 'literal',
  returnedTypes: [FunctionDataType.Number],
  modelClass: LiteralFunction,
  createFromSpec,
});
