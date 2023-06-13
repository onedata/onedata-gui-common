/**
 * Model of `abs` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { FunctionDataType } from './common';
import FunctionBase from './function-base';

const attachableArgumentSpecsMap = Object.freeze({
  data: {
    name: 'data',
    compatibleTypes: [FunctionDataType.Points, FunctionDataType.Number],
  },
});

const AbsFunction = FunctionBase.extend({
  /**
   * @public
   * @type {FunctionBase | null}
   */
  data: null,

  /**
   * @override
   */
  attachableArgumentSpecs: Object.freeze([attachableArgumentSpecsMap.data]),

  /**
   * @override
   */
  returnedTypes: computed('data.returnedTypes', function returnedTypes() {
    return this.data?.returnedTypes ??
      attachableArgumentSpecsMap.data.compatibleTypes;
  }),
});

/**
 * @type {FunctionSpec<AbsFunction>}
 */
export default Object.freeze({
  name: 'abs',
  returnedTypes: [FunctionDataType.Points, FunctionDataType.Number],
  modelClass: AbsFunction,
});
