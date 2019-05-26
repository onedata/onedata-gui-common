import Service from '@ember/service';

export default Service.extend({
  infoMessages: undefined,

  init() {
    this._super(...arguments);
    this.set('infoMessages', []);
  },

  info(message) {
    this.get('infoMessages').push(message);
  },

  // TODO: Add more global-notify methods if necessary.

  _clearMessages() {
    this.set('infoMessages', []);
  },
});
