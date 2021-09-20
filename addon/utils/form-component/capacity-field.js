/**
 * A capacity form field.
 *
 * @module utils/form-component/capacity-field
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed, getProperties } from '@ember/object';
import { validator } from 'ember-cp-validations';
import ErrorMessages from 'ember-cp-validations/validators/messages';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

export default FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/capacity-field',

  /**
   * Default value is set in `init`
   * @virtual optional
   * @type {Array<String>}
   */
  allowedUnits: undefined,

  /**
   * @virtual optional
   * @type {number}
   */
  gt: undefined,

  /**
   * @virtual optional
   * @type {number}
   */
  gte: 0,

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
   * @type {ComputedProperty<HtmlSafe>}
   */
  placeholder: computed('i18nPrefix', 'path', function placeholder() {
    return this.t(`${this.get('path')}.placeholder`, {}, { defaultValue: '' });
  }),

  /**
   * @type {ComputedProperty<Object>}
   */
  numberValidator: computed(
    'gt',
    'gte',
    'lt',
    'lte',
    'errorMessages',
    function numberValidator() {
      const {
        gt,
        gte,
        lt,
        lte,
        errorMessages,
      } = this.getProperties(
        'gt',
        'gte',
        'lt',
        'lte',
        'errorMessages'
      );

      return validator('number', {
        allowString: true,
        // empty values are handled by presenceValidator
        allowBlank: true,
        gt: this.normalizeBoundaryValue(gt),
        gte: this.normalizeBoundaryValue(gte),
        lt: this.normalizeBoundaryValue(lt),
        lte: this.normalizeBoundaryValue(lte),
        message(type, value, options) {
          const comparisons = ['gt', 'gte', 'lt', 'lte'];
          const errorMessageOptions =
            getProperties(options, 'description', ...comparisons);
          comparisons.forEach(comparison => {
            if (errorMessageOptions[comparison] !== undefined) {
              errorMessageOptions[comparison] =
                bytesToString(errorMessageOptions[comparison]);
            }
          });

          return errorMessages.getMessageFor(type, errorMessageOptions);
        },
      });
    }
  ),

  /**
   * @type {ComputedProperty<EmberCpValidations.Validators.Messages>}
   */
  errorMessages: computed(function errorMessages() {
    return ErrorMessages.create();
  }),

  init() {
    this._super(...arguments);

    if (!this.get('allowedUnits')) {
      this.set('allowedUnits', ['MiB', 'GiB', 'TiB', 'PiB']);
    }

    this.registerInternalValidator('numberValidator');
  },

  normalizeBoundaryValue(value) {
    const parsedValue = parseFloat(value);
    return !Number.isNaN(value) ? parsedValue : undefined;
  },
});
