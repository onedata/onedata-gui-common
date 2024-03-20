/**
 * Base model for all chart functions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, defineProperty } from '@ember/object';
import _ from 'lodash';
import generateId from 'onedata-gui-common/utils/generate-id';
import ElementBase from '../element-base';
import { ElementType } from '../common';

/**
 * @typedef {DashboardElementValidationError} ChartFunctionUndefinedReturnTypeValidationError
 * @property {'chartFunctionUndefinedReturnType'} errorId
 */

/**
 * @typedef {DashboardElementValidationError} ChartFunctionWrongArgumentTypeAssignedValidationError
 * @property {'chartFunctionWrongArgumentTypeAssigned'} errorId
 * @property {{ relatedAttachableArgumentSpec: FunctionAttachableArgumentSpec, relatedAttachedArgumentFunction: Utils.AtmWorkflow.ChartDashboardEditor.FunctionBase }} errorDetails
 */

/**
 * @typedef {DashboardElementValidationError} ChartFunctionEmptyArgumentValidationError
 * @property {'chartFunctionEmptyArgument'} errorId
 * @property {{ relatedAttachableArgumentSpec: FunctionAttachableArgumentSpec }} errorDetails
 */

/**
 * @typedef {DashboardElementValidationError} ChartFunctionParameterInvalidValidationError
 * @property {'chartFunctionParameterInvalid'} errorId
 * @property {{ parameterName: string }} errorDetails
 */

/**
 * @typedef {DashboardElementValidationError} ChartFunctionDetachedValidationError
 * @property {'chartFunctionDetached'} errorId
 */

export default ElementBase.extend({
  /**
   * @public
   * @virtual
   * @type {string}
   */
  name: undefined,

  /**
   * @public
   * @virtual
   * @type {Array<FunctionDataType>}
   */
  returnedTypes: undefined,

  /**
   * @public
   * @virtual optional
   * @type {string}
   */
  id: undefined,

  /**
   * @public
   * @virtual optional
   * @type {Array<FunctionAttachableArgumentSpec>}
   */
  attachableArgumentSpecs: Object.freeze([]),

  /**
   * When set to true, function-renderer component will automatically render
   * dedicated settings component for this function. See more in function-renderer
   * component.
   * @public
   * @virtual optional
   * @type {boolean}
   */
  hasSettingsComponent: false,

  /**
   * `true` value of this property means, that this specific function is a
   * top-level function (the beginning of the functions chain) and as such it
   * should behave a bit differently than the ordinary function.
   * @public
   * @virtual optional
   * @type {boolean}
   */
  isRoot: false,

  /**
   * @virtual optional
   * @type {Array<DashboardElementValidationError>}
   */
  functionSpecificValidationErrors: Object.freeze([]),

  /**
   * Defined when function is detached. Represents position of this function
   * relative to the root (output) function. The root function is always in the
   * left-center placement of the editor, so can be considered a fixed element -
   * good as a reference point.
   * @type {{ left: number, top: number } | null}
   */
  positionRelativeToRootFunc: null,

  /**
   * @override
   */
  elementType: ElementType.Function,

  /**
   * @override
   */
  referencingPropertyNames: computed(
    'attachableArgumentSpecs.[]',
    function referencingPropertyNames() {
      return [...this.attachableArgumentSpecs.map(({ name }) => name), 'parent'];
    }
  ),

  /**
   * @override
   */
  directValidationErrors: computed(
    'returnedTypes',
    'attachedFunctionsRelatedValidationErrors',
    'functionSpecificValidationErrors',
    'isDetached',
    function directValidationErrors() {
      const errors = [
        ...this.functionSpecificValidationErrors,
        ...this.attachedFunctionsRelatedValidationErrors,
      ];

      if (this.returnedTypes.length > 1) {
        errors.push({
          element: this,
          errorId: 'chartFunctionUndefinedReturnType',
        });
      }

      if (this.isDetached) {
        errors.push({
          element: this,
          errorId: 'chartFunctionDetached',
        });
      }

      return errors;
    }
  ),

  /**
   * @override
   */
  nestedValidationErrors: computed(
    'collectedAttachedFunctions.@each.validationErrors',
    function nestedValidationErrors() {
      return _.flatten(
        this.collectedAttachedFunctions
        .map(({ validationErrors }) => validationErrors)
      );
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.AtmWorkflow.ChartDashboardEditor.FunctionBase>>}
   */
  collectedAttachedFunctions: undefined,

  /**
   * @type {ComputedProperty<boolean>}
   */
  isDetached: computed('parent.detachedFunctions.[]', function isDetached() {
    return Boolean(this.parent?.detachedFunctions?.includes(this));
  }),

  /**
   * @type {ComputedProperty<Array<DashboardElementValidationError>}
   */
  attachedFunctionsRelatedValidationErrors: computed(
    'collectedAttachedFunctions.@each.returnedTypes',
    function attachedFunctionsRelatedValidationErrors() {
      const argumentsWithFunctions = new Set();

      const errors = [];
      (this.collectedAttachedFunctions ?? []).forEach((attachedFunction) => {
        const argumentName = this.getArgumentNameForAttachedFunction(attachedFunction);
        const argumentSpec = this.attachableArgumentSpecs
          .find(({ name }) => name === argumentName);
        argumentsWithFunctions.add(argumentName);
        if (
          argumentSpec &&
          attachedFunction.returnedTypes.length === 1 &&
          !argumentSpec.compatibleTypes.includes(attachedFunction.returnedTypes[0])
        ) {
          errors.push({
            element: this,
            errorId: 'chartFunctionWrongArgumentTypeAssigned',
            errorDetails: {
              relatedAttachableArgumentSpec: argumentSpec,
              relatedAttachedArgumentFunction: attachedFunction,
            },
          });
        }
      });

      this.attachableArgumentSpecs.forEach((spec) => {
        if (!argumentsWithFunctions.has(spec.name)) {
          errors.push({
            element: this,
            errorId: 'chartFunctionEmptyArgument',
            errorDetails: {
              relatedAttachableArgumentSpec: spec,
            },
          });
        }
      });

      return errors;
    }
  ),

  /**
   * @override
   */
  init() {
    if (!this.id) {
      this.set('id', generateId());
    }

    const observedPropsForCollectedAttachedFunctions =
      this.attachableArgumentSpecs.map((spec) =>
        spec.isArray ? `${spec.name}.[]` : spec.name
      );
    defineProperty(this, 'collectedAttachedFunctions', computed(
      ...observedPropsForCollectedAttachedFunctions,
      function collectedAttachedFunctions() {
        return [...this.attachedFunctions()];
      }
    ));

    this._super(...arguments);
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      this.attachableArgumentSpecs.forEach(({ name, isArray }) => {
        if (this[name]) {
          if (isArray) {
            this[name].forEach((argElement) => argElement?.destroy?.());
          } else {
            this[name].destroy?.();
          }
          this.set(name, null);
        }
      });
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  * nestedElements() {
    for (const func of this.attachedFunctions()) {
      yield func;
      yield* func.nestedElements();
    }
  },

  /**
   * @override
   */
  * referencingElements() {
    if (this.parent) {
      yield this.parent;
    }
    yield* this.attachedFunctions();
  },

  /**
   * @returns {Generator<Utils.AtmWorkflow.ChartDashboardEditor.FunctionBase>}
   */
  * attachedFunctions() {
    for (const { name, isArray } of this.attachableArgumentSpecs) {
      if (this[name]) {
        if (isArray) {
          yield* this[name];
        } else {
          yield this[name];
        }
      }
    }
  },

  /**
   * @param {Utils.AtmWorkflow.ChartDashboardEditor.FunctionBase} attachedFunction
   * @returns {string | null}
   */
  getArgumentNameForAttachedFunction(attachedFunction) {
    for (const { name } of this.attachableArgumentSpecs) {
      if (
        this[name] === attachedFunction ||
        (Array.isArray(this[name]) && this[name].includes(attachedFunction))
      ) {
        return name;
      }
    }

    return null;
  },
});
