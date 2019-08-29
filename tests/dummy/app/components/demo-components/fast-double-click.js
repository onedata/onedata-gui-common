import Component from '@ember/component';

export default Component.extend({
  fastDoubleClickCount: 0,
  fastSingleClickCount: 0,
  origDoubleClickCount: 0,
  origSingleClickCount: 0,

  click() {
    this._super(...arguments);
    this.incrementProperty('fastSingleClickCount');
  },
  
  actions: {
    origSingleClicked() {
      this.incrementProperty('origSingleClickCount');
    },
    origDoubleClicked() {
      this.incrementProperty('origDoubleClickCount');
    },
    fastDoubleClicked() {
      this.incrementProperty('fastDoubleClickCount');
    },
  },
});
