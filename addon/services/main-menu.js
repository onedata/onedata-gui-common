import Ember from 'ember';

export default Ember.Service.extend({
  currentItemId: null,

  currentItemIdChanged(id) {
    this.set('currentItemId', id);
  },
});
