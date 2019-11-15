/**
 * A base component for building a sidebar view with two-level list
 *
 * @module components/two-level-sidebar
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { reads, equal, sort } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import { computed, get } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';
import _ from 'lodash';
import { array, raw } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['two-level-sidebar'],

  eventsBus: service(),
  navigationState: service(),
  sidebarResources: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.twoLevelSidebar',

  /**
   * @type {Object}
   * @namespace
   * @property {Ember.Array} collection
   * @property {string} resourceType
   */
  model: null,

  sortedCollection: sort('model.collection.list', 'sorting'),

  /**
   * Name of oneicon that should be displayed for each first-level element
   * To inject.
   * 
   * @type {string}
   */
  // TODO some generic icon
  firstLevelItemIcon: 'chceckbox-option',

  /**
   * Name of custom component used to render first level items.
   * If equals `undefined`, then default item layout is used.
   * @type {string}
   */
  firstLevelItemComponent: undefined,

  secondLevelItemsComponent: 'two-level-sidebar/second-level-items',

  /**
   * To inject.
   * Type of sidebar route (eg. clusters)
   * Mandatory field!
   * @abstract
   * @type {string}
   */
  sidebarType: undefined,

  /**
   * If true and sidebar collection is empty, button "Get started" will be visible.
   * @type {boolean}
   */
  showGetStartedWhenEmpty: true,

  /**
   * @type {boolean}
   */
  inSidenav: false,

  /**
   * @type {string}
   */
  filter: '',

  /**
   * @type {string}
   * @virtual optional
   */
  advancedFiltersComponent: undefined,

  /**
   * Filters received from advancedFiltersComponent.
   * @type {any}
   */
  advancedFilters: Object.freeze({}),

  /**
   * @type {boolean}
   */
  areAdvancedFiltersVisible: false,

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  sorting: computed('sidebarType', function sorting() {
    return this.get('sidebarResources').getItemsSortingFor(this.get('sidebarType'));
  }),

  /**
   * @type {Ember.ComputedProperty<Array<any>>}
   */
  filteredCollection: computed(
    'sortedCollection.@each.name',
    'filter',
    function filteredCollection() {
      const {
        sortedCollection,
        filter,
      } = this.getProperties('sortedCollection', 'filter');

      if (filter) {
        const queryRegExp = new RegExp(filter, 'i');
        return sortedCollection.filter(item => queryRegExp.test(get(item, 'name')));
      } else {
        return sortedCollection;
      }
    }
  ),

  init() {
    this._super(...arguments);

    // if we want to show second level items, we should have a sidebarType
    if (!isEmpty(this.get('sortedCollection')) &&
      !isEmpty(this.get('secondLevelItems')) &&
      !this.get('sidebarType')
    ) {
      throw new Error('component:two-level-sidebar: sidebarType is not defined');
    }
  },

  resourceType: reads('model.resourceType'),

  isCollectionEmpty: equal('sortedCollection.length', 0),

  primaryItemId: reads('navigationState.activeResourceId'),

  activeResourceType: reads('navigationState.activeResourceType'),

  primaryItem: array.findBy('model.collection.list', raw('id'), 'primaryItemId'),

  secondaryItemId: reads('navigationState.activeAspect'),

  secondaryItem: computed('secondLevelItems', 'secondaryItemId', function () {
    let {
      secondLevelItems,
      secondaryItemId
    } = this.getProperties('secondLevelItems', 'secondaryItemId');
    return _.find(secondLevelItems, { id: secondaryItemId });
  }),

  actions: {
    filterChanged(filter) {
      this.set('filter', filter);
    },
    toggleAdvancedFilters() {
      this.toggleProperty('areAdvancedFiltersVisible');
    },
    advancedFilterChanged(advancedFilters) {
      this.set('advancedFilters', advancedFilters);
    },
  }
});
