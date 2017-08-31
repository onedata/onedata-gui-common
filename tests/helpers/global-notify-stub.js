import Ember from 'ember';

export default Ember.Service.extend({
  infoMessages: [],
  
  info(message) {
    this.get('infoMessages').push(message);
  },

  // TODO: Add more global-notify methods if necessary.

  _clearMessages() {
    this.set('infoMessages', []);
  },
});
