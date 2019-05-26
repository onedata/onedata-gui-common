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

  show() {},
});
