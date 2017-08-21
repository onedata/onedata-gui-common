import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-list-wrapper';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['one-list-wrapper'],

  items: null,

  isCollectionEmpty: computed.empty('items')
});
