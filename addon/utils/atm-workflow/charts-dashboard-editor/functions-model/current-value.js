/**
 * Model of `currentValue` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { FunctionDataType } from './common';
import FunctionBase from './function-base';

const CurrentValueFunction = FunctionBase.extend({
  /**
   * @override
   */
  returnedTypes: Object.freeze([FunctionDataType.Number]),
});

/**
 * @type {FunctionSpec<CurrentValueFunction>}
 */
export default Object.freeze({
  name: 'currentValue',
  returnedTypes: [FunctionDataType.Number],
  modelClass: CurrentValueFunction,
});
