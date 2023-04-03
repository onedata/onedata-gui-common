/**
 * A form field base for all fields which selects one value from a defined set.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed, get } from '@ember/object';

/**
 * @typedef {Object} FieldOption
 * @property {String} [name]
 * @property {any} value
 * @property {String|HtmlSafe} [label]
 * @property {String} [icon]
 * @property {boolean} [disabled]
 */

export default FormField.extend({
  /**
   * @override
   */
  withValidationIcon: false,

  /**
   * Array of possible values to select.
   * @virtual
   * @type {Array<FieldOption>}
   */
  options: Object.freeze([]),

  /**
   * @type {ComputedProperty<Array<FieldOption>>}
   */
  preparedOptions: computed('options.[]', 'translationPath', function preparedOptions() {
    return (this.get('options') || []).map(option => {
      const name = get(option, 'name') || String(get(option, 'value'));
      const label = get(option, 'label') ||
        this.getTranslation(`options.${name}.label`, {}, { defaultValue: '' });
      return Object.assign({}, option, { name, label });
    });
  }),
});
