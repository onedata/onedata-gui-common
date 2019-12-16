import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/form-fields-group';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,
  classNames: ['form-fields-group'],

  /**
   * @type {ComputedProperty<boolean>}
   */
  isExpanded: reads('field.isExpanded'),
});
