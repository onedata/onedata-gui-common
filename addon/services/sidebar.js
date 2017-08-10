import Ember from 'ember';

const {
  A,
  computed
} = Ember;

/**
 * Global control over sidebar
 */
export default Ember.Service.extend({
  itemPath: computed(function() {
    return A();
  }).readOnly(),
  
  changeItems(level, ...items) {
    let itemPath = this.get('itemPath');
    itemPath.replace(level, itemPath.length - level, items);
  }
});
