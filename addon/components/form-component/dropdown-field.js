import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import layout from '../../templates/components/form-component/dropdown-field';
import { get } from '@ember/object';

export default FieldComponentBase.extend({
  layout,
  classNames: ['dropdown-field'],

  actions: {
    valueChanged(option) {
      this._super(get(option, 'value'));
    },
    triggerFocusLost() {
      // Focus lost due to opening dropdown should be omitted
      if (this.$('.ember-basic-dropdown-trigger').attr('aria-expanded') !== 'true') {
        this.send('focusLost');
      }
    },
  },
});
