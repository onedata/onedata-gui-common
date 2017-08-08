import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-sidebar';

const {
  computed,
  computed: {
    readOnly
  },
  inject: {
    service
  }
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['one-sidebar'],

  sidebar: service(),

  resourcesModel: null,

  currentItemId: readOnly('sidebar.currentItemId'),

  buttons: readOnly('resourcesModel.buttons'),

  title: computed('resourcesModel.resourceType', function() {
    let resourcesType = this.get('resourcesModel.resourceType');
    return resourcesType;
  }),
});
