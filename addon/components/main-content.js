import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/main-content';

const {
  computed: {
    alias
  }
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['main-content'],

  resource: null,

  title: alias('resource.resourceId')
});
