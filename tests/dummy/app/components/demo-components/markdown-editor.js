import Component from '@ember/component';

export default Component.extend({
  mode: 'preview',

  actions: {
    contentChanged(content) {
      this.set('content', content);
    },
  },
});
