import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed, get } from '@ember/object';

export default FormField.extend({
  /**
   * @virtual
   */
  fieldComponentName: 'form-component/radio-field',

  /**
   * @virtual
   */
  withValidationIcon: false,

  /**
   * @virtual
   * @public
   * @type {Array<{ value: any, name: String }>}
   */
  options: Object.freeze([]),

  /**
   * @type {ComputedProperty<Array<{ value: any, name: String, label: HtmlSafe }>>}
   */
  preparedOptions: computed('options.[]', 'path', function preparedOptions() {
    const {
      options,
      path,
    } = this.getProperties('options', 'path');

    const newOptions = [];
    (options || []).forEach(option => {
      const name = get(option, 'name');
      const label = get(option, 'label') ||
        this.t(`${path}.options.${name}.label`);

      newOptions.push(Object.assign({}, option, { label: label }))
    });

    return newOptions;
  }),
})
