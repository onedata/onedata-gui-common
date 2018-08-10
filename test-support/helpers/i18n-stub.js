import Service from '@ember/service';
import { get } from '@ember/object';

export default Service.extend({
  translations: undefined,

  init() {
    this._super(...arguments);
    if (!this.get('translations')) {
      this.set('translations', {});
    }
  },

  t(path, parts) {
    let translation = this.get(`translations.${path}`);
    if (translation) {
      const placeholders = translation.match(/{{{*\w+}}}*/g) || [];
      placeholders.forEach(placeholder => {
        const bracketless = placeholder.replace(/{+|}+/g, '');
        translation = translation.split(placeholder).join(get(parts, bracketless));
      });
    }
    return translation;
  }
});
