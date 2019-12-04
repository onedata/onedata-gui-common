import OptionsField from 'onedata-gui-common/utils/form-component/options-field';
import { computed } from '@ember/object';

export default OptionsField.extend({
  /**
   * @virtual
   */
  fieldComponentName: 'form-component/dropdown-field',

  /**
   * @type {ComputedProperty<HtmlSafe>}
   */
  loadingMessage: computed('i18nPrefix', 'path', function loadingMessage() {
    const translation = this.t(this.get('path') + '.loadingMessage');
    return String(translation).startsWith('<missing-') ? undefined : translation;
  }),

  /**
   * @type {ComputedProperty<HtmlSafe>}
   */
  placeholder: computed('i18nPrefix', 'path', function placeholder() {
    const translation = this.t(this.get('path') + '.placeholder');
    return String(translation).startsWith('<missing-') ? undefined : translation;
  }),
})
