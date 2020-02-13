import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/text-like-field';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,
  classNames: ['text-like-field'],

  /**
   * @type {ComputedProperty<SafeString>}
   */
  placeholder: reads('field.placeholder'),
});
