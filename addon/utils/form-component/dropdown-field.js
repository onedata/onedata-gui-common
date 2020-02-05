import OptionsField from 'onedata-gui-common/utils/form-component/options-field';
import { computed } from '@ember/object';

export default OptionsField.extend({
  /**
   * @virtual
   */
  fieldComponentName: 'form-component/dropdown-field',

  /**
   * @type {boolean}
   */
  showSearch: true,

  /**
   * @type {ComputedProperty<HtmlSafe>}
   */
  placeholder: computed('i18nPrefix', 'path', function placeholder() {
    // Null value, because powerselect converts `undefined` to string 'undefined'
    return this.tWithDefault(`${this.get('path')}.placeholder`, {}, null);
  }),
})
