/**
 * Model of `loadSeries` chart function variant, which loads series according to
 * dynamic series config (so it is a "repeated" series).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { FunctionDataType, FunctionExecutionContext } from './common';
import FunctionBase from './function-base';

const LoadRepeatedSeriesFunction = FunctionBase.extend({
  /**
   * @public
   * @virtual optional
   * @type {EmberObject<ReplaceEmptyParameters> | null}
   */
  replaceEmptyParameters: null,

  /**
   * @override
   */
  name: 'loadRepeatedSeries',

  /**
   * @override
   */
  returnedTypes: Object.freeze([FunctionDataType.Points]),
});

/**
 * @type {FunctionSpec<LoadRepeatedSeriesFunction>}
 */
export default Object.freeze({
  name: 'loadRepeatedSeries',
  returnedTypes: [FunctionDataType.Points],
  allowedContexts: [FunctionExecutionContext.RepeatedSeries],
  modelClass: LoadRepeatedSeriesFunction,
});
