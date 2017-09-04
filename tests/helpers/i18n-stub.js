import Ember from 'ember';

export default Ember.Service.extend({
  translations: {},
  
  t(path) {
    return this.get(`translations.${path}`);
  }
});
