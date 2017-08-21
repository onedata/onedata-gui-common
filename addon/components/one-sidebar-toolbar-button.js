import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-sidebar-toolbar-button';

const {
  computed: {
    readOnly
  }
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['one-sidebar-toolbar-button'],

  buttonModel: null,

  title: readOnly('buttonModel.title'),
  icon: readOnly('buttonModel.icon'),
  action: readOnly('buttonModel.action'),
});
