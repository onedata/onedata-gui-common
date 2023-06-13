/**
 * Model of `multiply` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { FunctionDataType } from './common';
import FunctionBase from './function-base';

const attachableArgumentSpecsMap = Object.freeze({
  operands: {
    name: 'operands',
    compatibleTypes: [FunctionDataType.Points, FunctionDataType.Number],
    isArray: true,
  },
});

const MultiplyFunction = FunctionBase.extend({
  /**
   * @public
   * @type {Array<FunctionBase>}
   */
  operands: undefined,

  /**
   * @override
   */
  attachableArgumentSpecs: Object.freeze([attachableArgumentSpecsMap.operands]),

  /**
   * @override
   */
  returnedTypes: computed('operands.@each.returnedTypes', function returnedTypes() {
    if (!this.operands?.length) {
      return attachableArgumentSpecsMap.operands.compatibleTypes;
    }

    const hasSomeOperandWithPoints = this.operands.some(({ returnedTypes }) =>
      returnedTypes.length === 1 && returnedTypes[0] === FunctionDataType.Points
    );
    if (hasSomeOperandWithPoints) {
      return [FunctionDataType.Points];
    }

    const hasOnlyOperandsWithNumbers = this.operands.every(({ returnedTypes }) =>
      returnedTypes.length === 1 && returnedTypes[0] === FunctionDataType.Number
    );
    if (hasOnlyOperandsWithNumbers) {
      return [FunctionDataType.Number];
    }

    return attachableArgumentSpecsMap.operands.compatibleTypes;
  }),

  init() {
    this._super(...arguments);
    if (!this.operands) {
      this.set('operands', []);
    }
  },
});

/**
 * @type {FunctionSpec<AbsFunction>}
 */
export default Object.freeze({
  name: 'multiply',
  returnedTypes: [FunctionDataType.Points, FunctionDataType.Number],
  modelClass: MultiplyFunction,
});
