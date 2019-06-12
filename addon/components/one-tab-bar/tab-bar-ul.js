import Component from '@ember/component';
import layout from '../../templates/components/one-tab-bar/tab-bar-ul';

export default Component.extend({
  layout,
  tagName: 'ul',
  attributeBindings: ['style'],
  classNames: ['tab-bar-ul', 'nav', 'nav-tabs'],

  activeTabId: undefined,

  style: 'left: 0;',

  actions: {
    tabClicked(tabId /*, clickEvent*/ ) {
      this.set('activeTabId', tabId);
    },
  }
});
