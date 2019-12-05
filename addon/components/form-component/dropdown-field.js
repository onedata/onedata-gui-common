import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/dropdown-field';
import { get } from '@ember/object';

export default FieldComponentBase.extend({
  layout,

  actions: {
    valueChanged(option) {
      this._super(get(option, 'value'));
    },
  },
});
