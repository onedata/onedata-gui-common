/**
 * Model of `abs` chart function.
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

const AbsFunction = FunctionBase.extend({
  /**
   * @public
   * @type {FunctionBase | null}
   */
  data: null,

  /**
   * @override
   */
  name: 'abs',

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
});

/**
 * @param {unknown} spec
 * @param {Partial<FunctionBase>} fieldsToInject
 * @param {(spec: unknown) => FunctionBase} convertAnySpecToFunction
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.Abs}
 */
function createFromSpec(spec, fieldsToInject, convertAnySpecToFunction) {
  const funcElement = AbsFunction.create({
    ...fieldsToInject,
    data: convertAnySpecToFunction(spec.functionArguments?.dataProvider),
  });
  if (funcElement.data) {
    set(funcElement.data, 'parentElement', funcElement);
  }
  return funcElement;
}

/**
 * @type {FunctionSpec<AbsFunction>}
 */
export default Object.freeze({
  name: 'abs',
  attachableArgumentSpecs,
  returnedTypes: [FunctionDataType.Points, FunctionDataType.Number],
  modelClass: AbsFunction,
  createFromSpec,
});
