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
});

/**
 * @param {unknown} spec
 * @param {Partial<FunctionBase>} fieldsToInject
 * @param {(spec: unknown) => FunctionBase} convertAnySpecToFunction
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.TimeDerivative}
 */
function createFromSpec(spec, fieldsToInject, convertAnySpecToFunction) {
  const funcElement = TimeDerivativeFunction.create({
    ...fieldsToInject,
    data: convertAnySpecToFunction(spec.functionArguments?.dataProvider),
  });
  if (funcElement.data) {
    set(funcElement.data, 'parentElement', funcElement);
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
