/**
 * Application main menu component.
 *
 * @module components/main-menu-column
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import EmberObject, { observer, set, setProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/main-menu';
import { getOwner } from '@ember/application';

export default Component.extend({
  layout,
  tagName: 'ul',
  classNames: ['main-menu', 'one-list'],
  classNameBindings: [
    'navigationState.globalSidenavResourceType:sidenav-opened',
  ],

  navigationState: service(),

  /**
   * @type {Array<object>}
   */
  items: null,

  /**
   * @type {Object}
   * Containes mapping itemId -> EmberObject, where each EmberObject has
   * boolean field `isVisible`
   */
  itemsVisibility: undefined,

  /**
   * @type {function}
   * @param {string} id
   * @return {undefined}
   */
  itemClicked: () => {},

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isLoadingItem: reads('navigationState.isActiveResourceCollectionLoading'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isFailedItem: reads('navigationState.hasActiveResourceCollectionLoadingFailed'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  currentItemId: reads('navigationState.activeResourceType'),

  itemsObserver: observer(
    'items.@each.{id,visibilityCondition}',
    function itemsObserver() {
      const items = this.get('items');

      // Determine items visibility according to `visibilityCondition` property
      // of each item.
      const itemsVisibility = EmberObject.create();
      items.forEach(({ id, visibilityCondition }) => {
        // EmberObject dedicated to store needed service injection and property
        // getter specified in `visibilityCondition`
        const conditionEnv = EmberObject.create();
        if (visibilityCondition !== undefined) {
          const serviceName = visibilityCondition.split('.')[0];
          setProperties(conditionEnv, {
            [serviceName]: getOwner(this).lookup(`service:${serviceName}`),
            isVisible: reads(visibilityCondition),
          });
        } else {
          set(conditionEnv, 'isVisible', true);
        }

        set(itemsVisibility, id, conditionEnv);
      });
      this.set('itemsVisibility', itemsVisibility);
    }
  ),

  init() {
    this._super(...arguments);

    this.itemsObserver();
  },

  actions: {
    itemClicked({ id }) {
      this.get('itemClicked')(id);
    },
  },
});
