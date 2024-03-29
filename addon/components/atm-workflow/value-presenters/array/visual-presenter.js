/**
 * A "visual" array value presenter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualPresenterBase from '../commons/visual-presenter-base';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/array/visual-presenter';
import {
  getSingleLineValuePresenter,
  getRawValuePresenter,
  getVisualValuePresenter,
} from 'onedata-gui-common/utils/atm-workflow/value-presenters';

export default VisualPresenterBase.extend({
  layout,

  /**
   * @override
   */
  dataSpecType: 'array',

  /**
   * @type {number}
   */
  showMoreItemsChunkSize: 50,

  /**
   * Contains mapping: (array index of item) -> true.
   * If some array index is present in this object, it means
   * that it should be expanded.
   * An object is used instad of an array, because for a large number
   * of expanded items it is faster to search keys in the object
   * instead of searching specific value in the array.
   * @type {Object<number, true>}
   */
  expandedItems: undefined,

  /**
   * @type {number}
   */
  visibleItemsCount: 0,

  /**
   * @type {ComputedProperty<AtmArray>}
   */
  itemsToRender: computed('value', 'visibleItemsCount', function itemsToRender() {
    return this.value?.slice(0, this.visibleItemsCount) ?? [];
  }),

  /**
   * @type {ComputedProperty<Array<{ key: string, value: unknown}>>}
   */
  itemsToRenderWithKeys: computed('itemsToRender', function itemsWithKeysToRender() {
    return this.itemsToRender.map((item) => ({ value: item, key: JSON.stringify(item) }));
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isShowingMoreItemsPossible: computed(
    'value',
    'visibleItemsCount',
    function isShowingMoreItemsPossible() {
      return (this.value?.length ?? 0) > this.visibleItemsCount;
    }
  ),

  /**
   * @type {ComputedProperty<AtmDataSpec>}
   */
  itemDataSpec: reads('dataSpec.itemDataSpec'),

  /**
   * @type {ComputedProperty<string>}
   */
  itemHeaderPresenterComponent: computed(
    'itemDataSpec',
    function itemHeaderPresenterComponent() {
      return getSingleLineValuePresenter(this.itemDataSpec);
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  itemContentPresenterComponent: computed(
    'itemDataSpec',
    function itemHeaderPresenterComponent() {
      return getVisualValuePresenter(this.itemDataSpec) ??
        getRawValuePresenter(this.itemDataSpec);
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.setProperties({
      expandedItems: {},
      visibleItemsCount: this.showMoreItemsChunkSize,
    });
  },

  actions: {
    toggleItemExpand(itemIndex) {
      let newExpandedItems;
      if (this.expandedItems[itemIndex]) {
        newExpandedItems = { ...this.expandedItems };
        delete newExpandedItems[itemIndex];
      } else {
        newExpandedItems = { ...this.expandedItems, [itemIndex]: true };
      }
      this.set('expandedItems', newExpandedItems);
    },
    showMoreItems() {
      this.set(
        'visibleItemsCount',
        this.visibleItemsCount + this.showMoreItemsChunkSize
      );
    },
  },
});
