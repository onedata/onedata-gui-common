import Component from '@ember/component';
import animateCss from 'onedata-gui-common/utils/animate-css';

export default Component.extend({
  classNames: ['dummy-animations'],
  actions: {
    startAnimation() {
      const element = this.get('element');

      const browserItem = element.querySelector('.animated-browser-item');
      animateCss(browserItem, 'pulse-bg-selected-file-highlight', 'very-slow');
    },
  },
});
