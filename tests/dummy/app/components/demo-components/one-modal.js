import Component from '@ember/component';

export default Component.extend({
  lipsum: 'lorem ipsum sit dolor amet',
  lipsumCount: 100,

  opened: true,

  incrementTimer: undefined,

  didInsertElement() {
    this._super(...arguments);
    this.set('incrementTimer', setInterval(() => {
      this.incrementProperty('lipsumCount', 10);
    }, 1000));
  },

  willDestroyElement() {
    this._super(...arguments);
    clearInterval(this.get('incrementTimer'));
  },

  actions: {
    onHide() {
      this.set('opened', false);
    },
  },
});
