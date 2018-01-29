import Ember from 'ember';
import layout from '../templates/components/actions-popover-content';

export default Ember.Component.extend({
  layout,
  tagName: 'ul',
  classNames: ['actions-popover-content', 'dropdown-menu'],
  
  /**
   * @type {Array<Action>>}
   */
  actionsArray: Object.freeze([]),

  /**
   * @type {function}
   * @return {undefined}
   */
  actionClicked: () => {},

  actions: {
    triggerAction(action) {
      action();
      this.get('actionClicked')();
    }
  }
});
