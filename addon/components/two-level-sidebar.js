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
import { get, computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';
import _ from 'lodash';

export default Component.extend({
  layout,
  classNames: ['two-level-sidebar'],

  eventsBus: service(),
  navigationState: service(),
  sidebarResources: service(),

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

  queryParams: undefined,

  /**
   * To inject.
   * Type of sidebar route (eg. clusters)
   * Mandatory field!
   * @abstract
   * @type {string}
   */
  sidebarType: undefined,

  /**
   * If true and sidebar collection is empty, button that creates new item
   * will be visible.
   * @type {boolean}
   */
  showCreateOnEmpty: true,

  /**
   * @type {ComputedProperty<Array<string>>}
   */
  sorting: computed('sidebarType', function sorting() {
    return this.get('sidebarResources').getItemsSortingFor(this.get('sidebarType'));
  }),

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

  primaryItem: computed(
    'primaryItemId',
    'model.collection.list.[]',
    function getPrimaryItem() {
      const {
        model,
        primaryItemId,
      } = this.getProperties('model', 'primaryItemId');
      return _.find(
        get(model, 'collection').toArray(),
        item => get(item, 'id') === primaryItemId
      );
    }
  ),

  secondaryItemId: reads('navigationState.activeAspect'),

  secondaryItem: computed('secondLevelItems', 'secondaryItemId', function () {
    let {
      secondLevelItems,
      secondaryItemId
    } = this.getProperties('secondLevelItems', 'secondaryItemId');
    return _.find(secondLevelItems, { id: secondaryItemId });
  }),
});
