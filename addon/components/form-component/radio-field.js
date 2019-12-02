import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/radio-field';
import { reads } from '@ember/object/computed';

export default FieldComponentBase.extend({
  layout,

  preparedOptions: reads('field.preparedOptions'),
});
