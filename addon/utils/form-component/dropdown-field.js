/**
 * A dropdown form field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020-2024 ACK CYFRONET AGH
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
   * If true, ignores provided `option.label` and uses `<NameConflict>` component to
   * render option label, which uses `name` and (optional) `conflictLabel` of record hold
   * on `option.value`. Only for option values that are records or objects with `name` or
   * `conflictLabel`.
   * @virtual optional
   * @type {boolean}
   */
  useRecordLabel: false,

  /**
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  placeholder: computed('i18nPrefix', 'translationPath', {
    get() {
      return this.customPlaceholder ??
        // Null value, because powerselect converts `undefined` to string 'undefined'
        this.getTranslation('placeholder', {}, { defaultValue: null });
    },
    set(key, value) {
      return this.customPlaceholder = value;
    },
  }),

  /**
   * @type {string | null}
   */
  customPlaceholder: null,
});
