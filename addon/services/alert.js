import Service from '@ember/service';

function aliasToShow(type) {
  return function (message, options) {
    return this.show(type, message, options);
  };
}

export default Service.extend({
  opened: false,
  type: null,
  text: null,

  info: aliasToShow('info'),
  success: aliasToShow('success'),
  warning: aliasToShow('warning'),
  error: aliasToShow('error'),

  show(type, text) {
    // TODO type is now ignored
    this.setProperties({ type, text, opened: true });
  },
});
