import Service from '@ember/service';
import { reads } from '@ember/object/computed';

function aliasToShow(type) {
  return function (message, options) {
    return this.show(type, message, options);
  };
}

export default Service.extend({
  opened: false,
  type: null,
  text: null,
  detailsText: reads('options.detailsText'),
  alwaysShowDetails: reads('options.alwaysShowDetails'),

  info: aliasToShow('info'),
  success: aliasToShow('success'),
  warning: aliasToShow('warning'),
  error: aliasToShow('error'),

  show(type, text, options = {}) {
    // TODO type is now ignored
    this.setProperties({
      type,
      text,
      opened: true,
      options,
    });
  },
});
