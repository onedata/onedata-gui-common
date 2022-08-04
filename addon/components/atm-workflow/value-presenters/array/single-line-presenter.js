import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { gt } from 'ember-awesome-macros';
import SingleLinePresenterBase from '../commons/single-line-presenter-base';
import { getSingleLineValuePresenter } from 'onedata-gui-common/utils/atm-workflow/value-presenters';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-presenters/array/single-line-presenter';

export default SingleLinePresenterBase.extend({
  layout,
  classNames: ['array-single-line-presenter'],

  /**
   * @virtual
   * @type {AtmArray}
   */
  value: undefined,

  /**
   * @type {number}
   */
  renderedItemsLimit: 10,

  /**
   * @type {ComputedProperty<AtmDataSpec>}
   */
  itemDataSpec: reads('dataSpec.valueConstraints.itemDataSpec'),

  /**
   * @type {ComputedProperty<string>}
   */
  itemPresenter: computed('itemDataSpec', function itemPresenter() {
    return getSingleLineValuePresenter(this.itemDataSpec);
  }),

  /**
   * @type {ComputedProperty<Array<unknown>>}
   */
  items: computed('value', function items() {
    return Array.isArray(this.value) ? this.value : [];
  }),

  /**
   * @type {ComputedProperty<Array<unknown>>}
   */
  itemsToRender: computed('items', 'renderedItemsLimit', function itemsToRender() {
    return this.items.slice(0, this.renderedItemsLimit);
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasMoreItems: gt('items.length', 'renderedItemsLimit'),
});
