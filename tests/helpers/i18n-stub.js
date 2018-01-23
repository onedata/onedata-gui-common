import Service from '@ember/service';

export default Service.extend({
  translations: undefined,

  init() {
    this._super(...arguments);
    this.set('translations', {});
  },

  t(path) {
    return this.get(`translations.${path}`);
  }
});
