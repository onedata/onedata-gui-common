/**
 * A static text form field.
 * 
 * @module utils/form-component/static-text-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed } from '@ember/object';

export default FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/static-text-field',

  /**
   * @override
   */
  isValid: true,

  /**
   * Will be shown to user if `value` is not defined.
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  text: computed('i18nPrefix', 'path', function text() {
    return this.t(`${this.get('path')}.text`, {}, { defaultValue: '' });
  }),
});
