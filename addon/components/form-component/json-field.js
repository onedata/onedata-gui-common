import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/json-field';

export default FieldComponentBase.extend({
  layout,
  classNames: ['json-field'],

  actions: {
    valueChanged({ value }) {
      this._super(value);
    },
  },
});
