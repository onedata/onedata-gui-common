import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/main-menu-item';
import { inject as service } from '@ember/service';

export default Component.extend({
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

  i18n: service(),

  item: null,
  isActive: false,
  isSelected: false,
  isLoading: false,
  isFailed: false,

  /**
   * @type {function}
   * @param {string} item
   * @returns {undefined}
   */
  itemClicked: () => {},

  /**
   * @type {Ember.ComputerProperty<string>}
   */
  name: computed('item.id', function name() {
    const {
      item,
      i18n,
    } = this.getProperties('item', 'i18n');
    return i18n.t(`tabs.${item.id}.menuItem`);
  }),

  click() {
    if (!this.get('isDisabled')) {
      let item = this.get('item');
      this.get('itemClicked')(item);
      return false;
    }
  }
});
