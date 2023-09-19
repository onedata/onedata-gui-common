/**
 * Model of `multiply` chart function.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, set } from '@ember/object';
import { FunctionDataType } from './common';
import FunctionBase from './function-base';

const operandsArgument = Object.freeze({
  name: 'operands',
  compatibleTypes: [FunctionDataType.Points, FunctionDataType.Number],
  isArray: true,
});
const attachableArgumentSpecs = Object.freeze([operandsArgument]);

const MultiplyFunction = FunctionBase.extend({
  /**
   * @public
   * @type {Array<FunctionBase>}
   */
  operands: undefined,

  /**
   * @override
   */
  name: 'multiply',

  /**
   * @override
   */
  attachableArgumentSpecs,

  /**
   * @override
   */
  returnedTypes: computed('operands.@each.returnedTypes', function returnedTypes() {
    if (!this.operands?.length) {
      return operandsArgument.compatibleTypes;
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

    return operandsArgument.compatibleTypes;
  }),

  init() {
    this._super(...arguments);
    if (!this.operands) {
      this.set('operands', []);
    }
  },

  /**
   * @override
   */
  clone() {
    const functionClone = MultiplyFunction.create({
      operands: this.operands.map((func) => func.clone()),
      positionRelativeToRootFunc: this.positionRelativeToRootFunc,
      parent: this.parent,
    });

    functionClone.operands.forEach((func) => set(func, 'parent', functionClone));

    return functionClone;
  },

  /**
   * @override
   */
  toJson() {
    return {
      functionName: 'multiply',
      functionArguments: {
        operandProviders: this.operands.map((operand) => operand.toJson()),
      },
    };
  },
});

/**
 * @param {unknown} spec
 * @param {Partial<FunctionBase>} fieldsToInject
 * @param {(spec: unknown) => FunctionBase} convertAnySpecToFunction
 * @returns {Utils.AtmWorkflow.ChartsDashboardEditor.FunctionsModel.Multiply}
 */
function createFromSpec(spec, fieldsToInject, convertAnySpecToFunction) {
  const funcElement = MultiplyFunction.create({
    ...fieldsToInject,
    operands: spec.functionArguments?.operandProviders
      ?.map((operandSpec) => convertAnySpecToFunction(operandSpec)) ?? [],
  });
  funcElement.operands.forEach((operand) => set(operand, 'parent', funcElement));
  return funcElement;
}

/**
 * @type {FunctionSpec<MultiplyFunction>}
 */
export default Object.freeze({
  name: 'multiply',
  attachableArgumentSpecs,
  returnedTypes: [FunctionDataType.Points, FunctionDataType.Number],
  modelClass: MultiplyFunction,
  createFromSpec,
});
