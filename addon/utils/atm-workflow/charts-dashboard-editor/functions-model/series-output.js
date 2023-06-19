/**
 * Model of a special `seriesOutput` chart function which simulates the last
 * "output" series function (so the result points ready to visualise).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { FunctionDataType } from './common';
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
  attachableArgumentSpecs: Object.freeze([dataArgument]),

  /**
   * @override
   */
  returnedTypes: Object.freeze([FunctionDataType.Points]),
});

/**
 * @type {FunctionSpec<SeriesOutputFunction>}
 */
export default Object.freeze({
  name: 'seriesOutput',
  returnedTypes: [FunctionDataType.Points],
  isNotAvailableForUser: true,
  modelClass: SeriesOutputFunction,
});
