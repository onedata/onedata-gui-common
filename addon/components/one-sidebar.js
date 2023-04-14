/**
 * A base component for building a sidebar view with two-level list
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { reads, equal, sort } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import EmberObject, {
  computed,
  observer,
  get,
  setProperties,
} from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-sidebar';
import { array, raw } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { camelize } from '@ember/string';
import globals from 'onedata-gui-common/utils/globals';

export default Component.extend(I18n, {
  layout,
  classNames: ['one-sidebar'],
  classNameBindings: [
    'isLoadingItem:loading-item',
  ],

  eventsBus: service(),
  navigationState: service(),
  sidebarResources: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.oneSidebar',

  /**
   * @type {Object}
   * @property {Ember.Array} collection
   * @property {string} resourceType
   */
  model: null,

  /**
   * @type {EmberObject}
   */
  context: computed(() => EmberObject.create({
    collection: [],
    visibleCollection: [],
  })),

  /**
   * @type {Ember.ComputedProperty<Array<object>>}
   */
  buttons: computed('resourceType', 'context', function buttons() {
    const {
      sidebarResources,
      context,
      resourceType,
    } = this.getProperties(
      'sidebarResources',
      'context',
      'resourceType'
    );

    return sidebarResources.getButtonsFor(resourceType, context);
  }),

  /**
   * If true, level-0 item should present a loading state
   * @type {boolean}
   */
  isLoadingItem: reads('navigationState.isActiveResourceLoading'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  title: computed('model.resourceType', function title() {
    const resourcesType = this.get('model.resourceType');
    return resourcesType ?
      this.get('i18n').t(`tabs.${camelize(resourcesType)}.menuItem`) : '';
  }),

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

  /**
   * @type {String}
   */
  secondLevelItemsComponent: 'one-sidebar/second-level-items',

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
  areAdvancedFiltersVisible: true,

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  sorting: computed('sidebarType', function sorting() {
    return this.get('sidebarResources').getItemsSortingFor(this.get('sidebarType'));
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  resourceType: reads('model.resourceType'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isCollectionEmpty: equal('sortedCollection.length', 0),

  /**
   * @type {ComputedProperty<String>}
   */
  primaryItemId: reads('navigationState.activeResourceId'),

  /**
   * @type {ComputedProperty<String>}
   */
  activeResourceType: reads('navigationState.activeResourceType'),

  /**
   * @type {ComputedProperty<Object>}
   */
  primaryItem: array.findBy('model.collection.list', raw('id'), 'primaryItemId'),

  /**
   * @type {ComputedProperty<String>}
   */
  secondaryItemId: reads('navigationState.activeAspect'),

  /**
   * @type {ComputedProperty<Object>}
   */
  secondaryItem: array.findBy('secondLevelItems', raw('id'), 'secondaryItemId'),

  /**
   * @type {Ember.ComputedProperty<Array<any>>}
   */
  sortedCollection: sort('model.collection.list', 'sorting'),

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

  contextUpdater: observer(
    'sortedCollection',
    'filteredCollection',
    function contextUpdater() {
      const {
        sortedCollection,
        filteredCollection,
        context,
      } = this.getProperties(
        'sortedCollection',
        'filteredCollection',
        'context'
      );

      setProperties(context, {
        collection: sortedCollection,
        visibleCollection: filteredCollection,
      });
    }
  ),

  init() {
    this._super(...arguments);

    const {
      sortedCollection,
      secondLevelItems,
      sidebarType,
    } = this.getProperties(
      'sortedCollection',
      'secondLevelItems',
      'sidebarType',
    );

    // if we want to show second level items, we should have a sidebarType
    if (!isEmpty(sortedCollection) && !isEmpty(secondLevelItems) && !sidebarType) {
      throw new Error('component:one-sidebar: sidebarType is not defined');
    }

    if (
      globals.localStorage.getItem('oneSidebar.areAdvancedFiltersVisible') === 'false'
    ) {
      this.set('areAdvancedFiltersVisible', false);
    }

    this.contextUpdater();
  },

  actions: {
    toggleAdvancedFilters() {
      this.toggleProperty('areAdvancedFiltersVisible');

      globals.localStorage.setItem(
        'oneSidebar.areAdvancedFiltersVisible',
        String(this.areAdvancedFiltersVisible)
      );
    },
  },
});
