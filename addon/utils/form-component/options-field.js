import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed, get } from '@ember/object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';

/**
 * @typedef {Object} FieldOption
 * @property {string} [name]
 * @property {any} value
 * @property {string|HtmlSafe} [label]
 */

export default FormField.extend({
  /**
   * @virtual
   */
  withValidationIcon: false,

  /**
   * @virtual
   * @public
   * @type {Array<FieldOption>|PromiseArray<FieldOption>}
   */
  options: Object.freeze([]),

  /**
   * @type {ComputedProperty<PromiseArray<FieldOption>>}
   */
  preparedOptions: computed(
    'options.{[],isFulfilled}',
    'path',
    function preparedOptions() {
      let options = this.get('options');
      if (!options || !options.then) {
        options = resolve(options);
      }

      return PromiseArray.create({
        promise: options.then(options => this.prepareOptions(options)),
      });
    }
  ),

  prepareOptions(options) {
    const path = this.get('path');
    const newOptions = [];
    (options || []).forEach(option => {
      const name = get(option, 'name') || String(get(option, 'value'));
      const label = get(option, 'label') ||
        this.t(`${path}.options.${name}.label`);

      newOptions.push(Object.assign({}, option, { name, label }))
    });

    return newOptions;
  },
})
