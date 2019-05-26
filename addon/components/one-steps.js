import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-steps';

export default Component.extend({
  layout,
  tagName: 'ul',
  classNames: ['one-steps'],
  currentIndex: 0,
});
