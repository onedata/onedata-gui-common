/**
 * Model of `timeDerivative` chart function.
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
 * @type {FunctionSpec<TimeDerivativeFunction>}
 */
export default Object.freeze({
  name: 'timeDerivative',
  returnedTypes: [FunctionDataType.Points, FunctionDataType.Number],
  modelClass: TimeDerivativeFunction,
});
