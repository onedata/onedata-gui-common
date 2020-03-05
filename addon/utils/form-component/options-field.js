/**
 * A form field base for all fields which selects one value from a defined set.
 * 
 * @module utils/options-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed, get } from '@ember/object';

/**
 * @typedef {Object} FieldOption
 * @property {string} [name]
 * @property {any} value
 * @property {string|HtmlSafe} [label]
 * @property {string} [icon]
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
  preparedOptions: computed('options.[]', 'path', function preparedOptions() {
    const {
      options,
      path,
    } = this.getProperties('options', 'path');

    return (options || []).map(option => {
      const name = get(option, 'name') || String(get(option, 'value'));
      const label = get(option, 'label') ||
        this.t(`${path}.options.${name}.label`, {}, { defaultValue: '' });
      return Object.assign({}, option, { name, label });
    });
  }),
})
