/**
 * A number form field.
 *
 * @module utils/form-component/number-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TextField from 'onedata-gui-common/utils/form-component/text-field';
import { computed } from '@ember/object';
import { validator } from 'ember-cp-validations';

export default TextField.extend({
  /**
   * @override
   */
  inputType: 'number',

  /**
   * @virtual optional
   * @type {number}
   */
  gt: undefined,

  /**
   * @virtual optional
   * @type {number}
   */
  gte: undefined,

  /**
   * @virtual optional
   * @type {number}
   */
  lt: undefined,

  /**
   * @virtual optional
   * @type {number}
   */
  lte: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  integer: false,

  /**
   * @type {ComputedProperty<Object>}
   */
  numberValidator: computed(
    'gt',
    'gte',
    'lt',
    'lte',
    'integer',
    function numberValidator() {
      const {
        gt,
        gte,
        lt,
        lte,
        integer,
      } = this.getProperties(
        'gt',
        'gte',
        'lt',
        'lte',
        'integer'
      );

      return validator('number', {
        allowString: true,
        // empty values are handled by presenceValidator
        allowBlank: true,
        gt: this.normalizeBoundaryValue(gt),
        gte: this.normalizeBoundaryValue(gte),
        lt: this.normalizeBoundaryValue(lt),
        lte: this.normalizeBoundaryValue(lte),
        integer,
      });
    }
  ),

  init() {
    this._super(...arguments);

    this.registerInternalValidator('numberValidator');
  },

  normalizeBoundaryValue(value) {
    const parsedValue = parseFloat(value);
    return !Number.isNaN(value) ? parsedValue : undefined;
  },
});
