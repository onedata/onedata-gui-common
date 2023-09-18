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
  data: 1,

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

  /**
   * @override
   */
  toJson() {
    return {
      functionName: 'literal',
      functionArguments: {
        data: this.data,
      },
    };
  },
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
  attachableArgumentSpecs: [],
  returnedTypes: [FunctionDataType.Number],
  modelClass: LiteralFunction,
  createFromSpec,
});
