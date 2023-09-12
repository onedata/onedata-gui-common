/**
 * Model of a special `seriesOutput` chart function which simulates the last
 * "output" series function (so the result points ready to visualise).
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
  compatibleTypes: [FunctionDataType.Points],
});
const attachableArgumentSpecs = Object.freeze([dataArgument]);

const SeriesOutputFunction = FunctionBase.extend({
  /**
   * @public
   * @type {FunctionBase | null}
   */
  data: null,

  /**
   * @override
   */
  name: 'seriesOutput',

  /**
   * @override
   */
  attachableArgumentSpecs,

  /**
   * @override
   */
  returnedTypes: Object.freeze([FunctionDataType.Points]),

  /**
   * @override
   */
  isRoot: true,

  /**
   * @override
   */
  toJson() {
    if (!this.data) {
      return null;
    }
    return this.data.toJson();
  },
});

/**
 * @param {unknown} spec
 * @param {Partial<FunctionBase>} fieldsToInject
 * @param {(spec: unknown) => FunctionBase} convertAnySpecToFunction
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.SeriesOutput}
 */
function createFromSpec(spec, fieldsToInject, convertAnySpecToFunction) {
  const funcElement = SeriesOutputFunction.create({
    ...fieldsToInject,
    data: convertAnySpecToFunction(spec),
  });
  if (funcElement.data) {
    set(funcElement.data, 'parentElement', funcElement);
  }
  return funcElement;
}

/**
 * @type {FunctionSpec<SeriesOutputFunction>}
 */
export default Object.freeze({
  name: 'seriesOutput',
  attachableArgumentSpecs,
  returnedTypes: [FunctionDataType.Points],
  isNotAvailableForUser: true,
  allowedContexts: [
    FunctionExecutionContext.Series,
    FunctionExecutionContext.RepeatedSeries,
  ],
  modelClass: SeriesOutputFunction,
  createFromSpec,
});
