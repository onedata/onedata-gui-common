import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed } from '@ember/object';

export default FormField.extend({
  /**
   * @virtual
   */
  fieldComponentName: 'form-component/static-text-field',

  /**
   * @override
   */
  isValid: true,

  /**
   * @public
   * @type {ComputedProperty<HtmlSafe>}
   * Will be shown to user if value is not set.
   */
  text: computed('i18nPrefix', 'path', function text() {
    return this.tWithDefault(`${this.get('path')}.text`, {}, undefined);
  }),
})
