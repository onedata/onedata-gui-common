import Service from '@ember/service';

export default Service.extend({
  translations: {},

  t(path) {
    return this.get(`translations.${path}`);
  }
});
