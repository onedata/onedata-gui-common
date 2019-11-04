import { computed, get } from '@ember/object';
import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-list-wrapper';

export default Component.extend({
  layout,
  classNames: ['one-list-wrapper'],

  items: Object.freeze([]),

  /**
   * @type {Ember.ComputedProperty<Array<any>>}
   */
  filteredItems: computed('items.@each.name', 'query', function filteredItems() {
    const {
      items,
      query,
    } = this.getProperties('items', 'query');

    if (query) {
      const queryRegExp = new RegExp(query, 'i'); 
      return items.filter(item => queryRegExp.test(get(item, 'name')));
    } else {
      return items;
    }
  }),
});
