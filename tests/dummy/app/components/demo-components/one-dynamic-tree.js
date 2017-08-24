import Ember from 'ember';

const {
  run: {
    next,
  },
} = Ember;

export default Ember.Component.extend({
  _isValid: null,
  checked: false,

  actions: {
    valuesChanged(values, isValid) {
      console.log('Tree values:');
      console.log(values)
      next(() => this.set('_isValid', isValid));
    },
  }
});
