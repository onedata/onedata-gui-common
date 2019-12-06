import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/static-text-field';
import { or } from 'ember-awesome-macros';

export default FieldComponentBase.extend({
  layout,
  classNames: ['static-text-field'],

  /**
   * @type {ComputedProperty<String>}
   */
  text: or('field.value', 'field.text'),
});
