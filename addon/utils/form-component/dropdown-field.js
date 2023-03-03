/**
 * A dropdown form field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OptionsField from 'onedata-gui-common/utils/form-component/options-field';
import { computed } from '@ember/object';

export default OptionsField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/dropdown-field',

  /**
   * @virtual optional
   * @type {boolean}
   */
  showSearch: true,

  /**
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  placeholder: computed('i18nPrefix', 'translationPath', function placeholder() {
    // Null value, because powerselect converts `undefined` to string 'undefined'
    return this.getTranslation('placeholder', {}, { defaultValue: null });
  }),
});
