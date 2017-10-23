/**
 * A base component for building a sidebar view with two-level list
 *
 * @module components/two-level-sidebar
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';
import { invokeAction } from 'ember-invoke-action';
import _ from 'lodash';

const {
  inject: {
    service
  },
  computed: {
    readOnly
  },
  computed,
  isEmpty,
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['two-level-sidebar'],

  sidebar: service(),
  eventsBus: service(),

  model: null,

  /**
   * Should sidebar:select event be triggered after primary item selection?
   * @type {boolean}
   */
  triggerEventOnPrimaryItemSelection: false,

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
   * @type {string}
   */
  firstLevelItemComponent: undefined,

  /**
   * To inject.
   * Type of sidebar route (eg. clusters)
   * Mandatory field!
   * @abstract
   * @type {string}
   */
  sidebarType: undefined,

  init() {
    this._super(...arguments);

    // if we want to show second level items, we should have a sidebarType
    if (!isEmpty(this.get('model.collection')) &&
      !isEmpty(this.get('secondLevelItems')) &&
      !this.get('sidebarType')
    ) {
      throw new Error('component:two-level-sidebar: sidebarType is not defined');
    }
  },

  resourceType: readOnly('model.resourceType'),

  isCollectionEmpty: computed.equal('model.collection.length', 0),

  primaryItemId: computed('sidebar.itemPath.[]', function () {
    return this.get('sidebar.itemPath').objectAt(0);
  }),

  secondaryItemId: computed('sidebar.itemPath.[]', function () {
    return this.get('sidebar.itemPath').objectAt(1);
  }),

  secondaryItem: computed('secondLevelItems', 'secondaryItemId', function () {
    let {
      secondLevelItems,
      secondaryItemId
    } = this.getProperties('secondLevelItems', 'secondaryItemId');
    return _.find(secondLevelItems, { id: secondaryItemId });
  }),

  actions: {
    changePrimaryItemId(itemId) {
      let resourceType = this.get('resourceType');
      if (this.get('triggerEventOnPrimaryItemSelection')) {
        this.get('eventsBus').trigger('sidebar:select');
      }
      return invokeAction(this, 'changeResourceId', resourceType, itemId);
    },
    sidebarSecondaryItemSelected() {
      this.get('eventsBus').trigger('sidebar:select', this.get('secondaryItem'));
    }
  },
});
