import Component from '@ember/component';

export default Component.extend({
  lipsum: 'lorem ipsum dolor sit amet',
  lipsumCount: 10,

  incrementTimer: undefined,

  didInsertElement() {
    this.set('incrementTimer', setInterval(() => {
      this.incrementProperty('lipsumCount', 10);
    }, 1000));
  },

  willDestroyElement() {
    this._super(...arguments);
    clearInterval(this.get('incrementTimer'));
  },
});
