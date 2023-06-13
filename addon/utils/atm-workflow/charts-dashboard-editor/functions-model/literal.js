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
  returnedTypes: Object.freeze([FunctionDataType.Number]),
});

/**
 * @type {FunctionSpec<LiteralFunction>}
 */
export default Object.freeze({
  name: 'literal',
  returnedTypes: [FunctionDataType.Number],
  modelClass: LiteralFunction,
});
