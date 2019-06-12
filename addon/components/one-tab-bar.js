import Component from '@ember/component';
import layout from '../templates/components/one-tab-bar';
import { reads } from '@ember/object/computed';
import { get } from '@ember/object';

export default Component.extend({
  layout,
  classNames: ['one-tab-bar'],

  items: undefined,

  // FIXME: items sorting

  sortedItems: reads('items'),

  init() {
    this._super(...arguments);
    this.set('selectedItem', this.get('sortedItems')[0]);
  },

  jumpToItem(itemId) {
    const $item = this.$(`.item-${itemId}`);
    if ($item.length) {
      const $content = this.$('.container-inner-scroll-content');
      $content.animate({ scrollLeft: $item[0].offsetLeft }, 200);
    }
  },

  actions: {
    /**
     * 
     * @param {string} selectType one of: tabClick, selector
     * @param {object} item on of `items`
     */
    selectItem(selectType, item) {
      this.set('selectedItem', item);
      if (selectType === 'selector') {
        this.jumpToItem(get(item, 'id'));
      }
    },
  }
});
