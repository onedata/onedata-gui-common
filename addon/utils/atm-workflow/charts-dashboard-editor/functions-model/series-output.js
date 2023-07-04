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
  attachableArgumentSpecs: Object.freeze([dataArgument]),

  /**
   * @override
   */
  returnedTypes: Object.freeze([FunctionDataType.Points]),
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
  returnedTypes: [FunctionDataType.Points],
  isNotAvailableForUser: true,
  allowedContexts: [
    FunctionExecutionContext.Series,
    FunctionExecutionContext.RepeatedSeries,
  ],
  modelClass: SeriesOutputFunction,
  createFromSpec,
});
