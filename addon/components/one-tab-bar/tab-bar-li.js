import Component from '@ember/component';
import layout from '../../templates/components/one-tab-bar/tab-bar-li';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['tab-bar-li'],
  classNameBindings: ['isActive:active'],

  isActive: false,

  tabClicked: notImplementedIgnore,

  actions: {
    anchorClicked(clickEvent) {
      return this.get('tabClicked')(clickEvent);
    },
  },
});
