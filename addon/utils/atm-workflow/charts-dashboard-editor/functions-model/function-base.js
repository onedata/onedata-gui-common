/**
 * Base model for all chart functions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
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
   * @override
   */
  * referencingElements() {
    if (this.parent) {
      yield this.parent;
    }
    yield* this.nestedElements();
  },
});
