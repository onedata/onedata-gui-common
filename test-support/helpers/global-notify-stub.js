import Service from '@ember/service';

function aliasToShow(type) {
  return function (message, options) {
    return this.show(type, message, options);
  };
}

export default Service.extend({
  info: aliasToShow('info'),
  success: aliasToShow('success'),
  warning: aliasToShow('warning'),
  error: aliasToShow('error'),

  show(type, message) {
    const property = `${type}Messages`;
    if (!this[property]) {
      this.set(property, []);
    }
    this[property].push(message);
  },

  _clearMessages() {
    for (const type of ['info', 'success', 'warning', 'error']) {
      const property = `${type}Messages`;
      if (this[property]) {
        this.set(property, []);
      }
    }
  },
});
