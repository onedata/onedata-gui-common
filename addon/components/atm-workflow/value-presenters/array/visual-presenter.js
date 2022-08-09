import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/array/visual-presenter';
import {
  getSingleLineValuePresenter,
  getRawValuePresenter,
  getVisualValuePresenter,
} from 'onedata-gui-common/utils/atm-workflow/value-presenters';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['visual-presenter', 'array-visual-presenter'],

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valuePresenters.array.visualPresenter',

  /**
   * @virtual
   * @type {AtmArray}
   */
  value: undefined,

  /**
   * @virtual
   * @type {AtmDataSpec}
   */
  dataSpec: undefined,

  /**
   * @virtual optional
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

  /**
   * If set to true, then this component is a top presenter component (has no
   * parent presenters).
   * @virtual optional
   * @type {boolean}
   */
  isRootPresenter: true,

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
  itemDataSpec: reads('dataSpec.valueConstraints.itemDataSpec'),

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
   * @type {ComputedProperty<string|null>}
   */
  topHeaderPresenterComponent: computed(
    'isRootPresenter',
    'dataSpec',
    function topHeaderPresenterComponent() {
      if (!this.isRootPresenter) {
        return null;
      }
      return getSingleLineValuePresenter(this.dataSpec);
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
