import Service from '@ember/service';

export default Service.extend({
  // Should be cleared out before each test
  callbacks: [],

  on(eventName, callback) {
    this.get('callbacks').push(callback);
  },

  off() {
    // TODO implement if necessary.
  },

  trigger() {
    let args = [].slice.call(arguments, 1);
    this.get('callbacks')
      .forEach(callback => callback.call(null, ...args));
  }
});
