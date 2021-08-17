import Component from '@ember/component';
import animateCss from 'onedata-gui-common/utils/animate-css';

export default Component.extend({
  classNames: ['dummy-animations'],
  isSlow: false,
  animationNames: Object.freeze([
    'pulse-mint',
    'pulse-orange',
    'pulse-red',
    'pulse-mint-gray',
    'pulse-bg-mint',
    'pulse-bg-light-mint',
    'pulse-bg-light-red',
    'pulse-bg-one-main',
    'pulse-red-text-color',
    'pulse-red-transparent',
    'pulse-inherit-disabled',
    'pulse-bg-selected-file-highlight',
  ]),
  actions: {
    startAnimation(animationName) {
      const element = this.get('element');

      const browserItem = element.querySelector('.animated-browser-item');
      animateCss(browserItem, animationName);
    },
  },
});
