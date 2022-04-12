import Service from '@ember/service';

export default Service.extend({
  // Should be cleared out before each test
  callbacks: undefined,

  init() {
    this._super(...arguments);
    this.set('callbacks', []);
  },

  on(eventName, callback) {
    this.get('callbacks').push(callback);
  },

  off() {
    // TODO implement if necessary.
  },

  trigger() {
    const args = [].slice.call(arguments, 1);
    this.get('callbacks')
      .forEach(callback => callback.call(null, ...args));
  },
});
