/**
 * A base component for building a sidebar view with two-level list
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads, equal, sort, bool } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import EmberObject, {
  computed,
  get,
} from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-sidebar';
import I18n from 'onedata-gui-common/mixins/i18n';
import { camelize } from '@ember/string';
import globals from 'onedata-gui-common/utils/globals';
import {
  destroyDestroyableComputedValues,
  destroyableComputed,
  initDestroyableCache,
} from 'onedata-gui-common/utils/destroyable-computed';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import { asyncObserver } from 'onedata-gui-common/utils/observer';

export const defaultAdvancedFilter = Object.freeze({});

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
   * @virtual
   * @type {OnedataSidebarRouteModel}
   */
  model: null,

  /**
   * Implementing infinite scroll in sidebar enables infinite scroll elements in the
   * common template.
   * @virtual optional
   * @type {Utils.InfiniteScroll}
   */
  infiniteScroll: undefined,

  /**
   * Name of oneicon that should be displayed for each first-level element
   * @virtual
   * @type {string}
   */
  firstLevelItemIcon: 'unknown',

  isFilteringEnabled: true,

  /**
   * If true, the spinner will be rendered at the top of the list.
   * @type {boolean}
   */
  isPrevSpinnerShown: false,

  /**
   * If true, the spinner will be rendered at the bottom of the list.
   * @type {boolean}
   */
  isNextSpinnerShown: false,

  /**
   * @type {string}
   */
  infiniteScrollSpinnerSize: 'sm',

  /**
   * @type {ComputedProperty<boolean>}
   */
  isInfiniteScroll: bool('infiniteScroll'),

  /**
   * @type {ComputedProperty<SidebarContext>}
   */
  context: computed(function context() {
    return SidebarContext.create({
      sidebar: this,
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Array<object>>}
   */
  buttons: destroyableComputed('resourceType', 'context', function buttons() {
    const {
      sidebarResources,
      context,
      resourceType,
    } = this;

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
    const resourcesType = this.model?.resourceType;
    return resourcesType ?
      this.i18n.t(`tabs.${camelize(resourcesType)}.menuItem`) : '';
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  searchPlaceholder: computed('model.resourceType', function searchPlaceholder() {
    const resourcesType = this.model?.resourceType;
    return resourcesType ?
      this.i18n.t(`tabs.${camelize(resourcesType)}.searchPlaceholder`) : '';
  }),

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
  advancedFilters: defaultAdvancedFilter,

  /**
   * @type {boolean}
   */
  areAdvancedFiltersVisible: true,

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  sorting: computed('sidebarType', function sorting() {
    return this.sidebarResources.getItemsSortingFor(this.sidebarType);
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
   * Stores last found primary item to avoid frequent find.
   * @type {Object}
   */
  primaryItemCache: undefined,

  /**
   * Stores previous primary item to avoid running jumps in observer when the item does
   * not change (but the observer is triggered).
   * @type {Object}
   */
  primaryItemPrev: undefined,

  /**
   * @type {ComputedProperty<Object>}
   */
  primaryItem: computed(
    'sortedCollection.@each.id',
    'primaryItemId',
    function primaryItem() {
      if (this.primaryItemPrev !== this.primaryItemCache) {
        this.set('primaryItemPrev', this.primaryItemCache);
      }
      const primaryItemId = this.primaryItemId;
      if (this.primaryItemCache?.id !== primaryItemId) {
        const item = this.sortedCollection?.find(({ id }) =>
          id === primaryItemId
        );
        this.set('primaryItemCache', item);
      }
      return this.primaryItemCache;
    }
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  secondaryItemId: reads('navigationState.activeAspect'),

  /**
   * @type {ComputedProperty<Object>}
   */
  secondaryItem: computed(
    'secondLevelItems.@each.id',
    'secondaryItemId',
    function secondaryItem() {
      return this.secondLevelItems?.find(({ id }) => id === this.secondaryItemId);
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<any>>}
   */
  sortedCollection: sort('model.collection.array', 'sorting'),

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
      } = this;

      if (filter) {
        const queryRegExp = new RegExp(filter, 'i');
        return sortedCollection.filter(item => queryRegExp.test(get(item, 'name')));
      } else {
        return sortedCollection;
      }
    }
  ),

  /**
   * @returns {Promise<false|undefined>} Returns false if the procedure is aborted.
   */
  handlePrimaryItemChange: asyncObserver(
    'primaryItem',
    async function handlePrimaryItemChange() {
      if (!this.primaryItem || this.primaryItemPrev === this.primaryItem) {
        return false;
      }
      await waitForRender();
      if (this.isDestroyed || this.isDestroying) {
        return false;
      }
      await this.scrollSidebarToActiveItem();
    }
  ),

  init() {
    initDestroyableCache(this);
    this._super(...arguments);

    const {
      sortedCollection,
      secondLevelItems,
      sidebarType,
    } = this;

    // if we want to show second level items, we should have a sidebarType
    if (!isEmpty(sortedCollection) && !isEmpty(secondLevelItems) && !sidebarType) {
      throw new Error('component:one-sidebar: sidebarType is not defined');
    }

    if (
      globals.localStorage.getItem('oneSidebar.areAdvancedFiltersVisible') === 'false'
    ) {
      this.set('areAdvancedFiltersVisible', false);
    }
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      destroyDestroyableComputedValues(this);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    this.handlePrimaryItemChange();
  },

  setFilter(expression) {
    this.set('filter', expression);
  },

  setAdvancedFilter(advancedFilter) {
    this.set('advancedFilters', advancedFilter);
  },

  /**
   * Note that this method works only if the sidebar is rendered in the static column (not
   * in temporary sidenav).
   * @returns
   */
  async scrollSidebarToActiveItem() {
    const colSidebar = this.element?.closest('.col-sidebar');
    if (!colSidebar || !this.primaryItem) {
      return;
    }
    await scrollSidebarToActiveItem(
      colSidebar,
      this.model.collection,
      this.primaryItem
    );
  },

  actions: {
    setFilter(expression) {
      this.setFilter(expression);
    },
    setAdvancedFilter(advancedFilter) {
      this.setAdvancedFilter(advancedFilter);
    },
    toggleAdvancedFilters() {
      this.toggleProperty('areAdvancedFiltersVisible');

      globals.localStorage.setItem(
        'oneSidebar.areAdvancedFiltersVisible',
        String(this.areAdvancedFiltersVisible)
      );
    },
  },
});

/**
 * Provides context of sidebar for other parts of code.
 */
class SidebarContext extends EmberObject {
  /** @type {Components.OneSidebar} */
  sidebar = undefined;

  @reads('sidebar.sortedCollection')
  sortedCollection;

  @reads('sidebar.filteredCollection')
  visibleCollection;
}

/**
 * @param {HTMLElement} sidebarElement
 * @param {SidebarCollection} collection
 * @param {any} resource
 * @returns
 */
async function scrollSidebarToActiveItem(sidebarElement, collection, resource) {
  if (!resource) {
    return;
  }
  let sidebarActiveItemNode = getActiveSidebarItemElement(sidebarElement);

  if (
    resource.index &&
    collection.chunksArray &&
    !sidebarActiveItemNode &&
    !collection.chunksArray.map(item => item.index).includes(resource.index)
  ) {
    await collection.chunksArray.scheduleJump(resource.index, 50);
    await waitForRender();
    sidebarActiveItemNode = getActiveSidebarItemElement(sidebarElement);
  }
  if (!sidebarActiveItemNode) {
    return;
  }

  const sidebarBoundingRect = sidebarElement.getBoundingClientRect();
  const activeItemBoundingRect = sidebarActiveItemNode.getBoundingClientRect();
  const activeItemYInSidebar = activeItemBoundingRect.top - sidebarBoundingRect.top;

  const minAllowedActiveItemY = 0;
  // At least 3/4 of the active item must be visible
  const maxAllowedActiveItemY = sidebarBoundingRect.height -
    activeItemBoundingRect.height * 0.75;
  if (
    activeItemYInSidebar < minAllowedActiveItemY ||
    activeItemYInSidebar > maxAllowedActiveItemY
  ) {
    sidebarActiveItemNode.scrollIntoView();
  }
}

/**
 * @param {HTMLElement} sidebarElement
 * @returns {HTMLElement|null}
 */
function getActiveSidebarItemElement(sidebarElement) {
  return sidebarElement.querySelector('.resource-item.active .item-header');
}
