import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/main-menu-item';

const {
  computed,
  String: {
    capitalize
  }
} = Ember;

export default Ember.Component.extend({
  layout,
  tagName: 'li',
  classNames: ['main-menu-item', 'one-list-item'],
  classNameBindings: [
    'isActive:active',
    'isSelected:selected',
    'isDisabled:disabled:enabled',
    'isDisabled::clickable',
    'isLoading:loading',
    'isFailed:failed',
  ],

  item: null,
  isActive: false,
  isSelected: false,
  isLoading: false,
  isFailed: false,

  name: computed('item.id', function () {
    let item = this.get('item');
    return capitalize(item.id);
  }),

  click() {
    if (!this.get('isDisabled')) {
      let item = this.get('item');
      this.sendAction('itemClicked', item);
      return false;
    }
  }
});
