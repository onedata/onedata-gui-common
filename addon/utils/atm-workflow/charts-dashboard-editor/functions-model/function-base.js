/**
 * Base model for all chart functions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import generateId from 'onedata-gui-common/utils/generate-id';
import ElementBase from '../element-base';
import { ElementType } from '../common';

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
   * should behave a bit differently that the ordinary function.
   * @public
   * @virtual optional
   * @type {boolean}
   */
  isRoot: false,

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
  referencingPropertyNames: computed('attachableArgumentSpecs.[]', function referencingPropertyNames() {
    return [...this.attachableArgumentSpecs.map(({ name }) => name), 'parent'];
  }),

  /**
   * @override
   */
  init() {
    if (!this.id) {
      this.set('id', generateId());
    }
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
   * @returns {Generator<Utils.AtmWorkflow.ChartsDashboardEditor.FunctionBase>}
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
});
