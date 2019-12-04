import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/dropdown-field';
import { reads } from '@ember/object/computed';
import { get } from '@ember/object';

export default FieldComponentBase.extend({
  layout,

  preparedOptions: reads('field.preparedOptions'),

  loadingMessage: reads('field.loadingMessage'),

  placeholder: reads('field.placeholder'),

  actions: {
    valueChanged(option) {
      this._super(get(option, 'value'));
    },
  },
});
