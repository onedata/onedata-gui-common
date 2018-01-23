/**
 * A general layout of sidebar and container for sidebar content
 *
 * @module components/one-sidebar
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
import { readOnly, reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/one-sidebar';

export default Component.extend({
  layout,
  classNames: ['one-sidebar'],
  classNameBindings: [
    'isLoadingItem:loading-item'
  ],

  sidebar: service(),
  sidebarResources: service(),

  resourcesModel: null,

  currentItemId: readOnly('sidebar.currentItemId'),

  /**
   * @type {Ember.ComputedProperty<Array<object>>}
   */
  buttons: computed('resourcesModel.resourceType', function () {
    const sidebarResources = this.get('sidebarResources');
    const resourcesType = this.get('resourcesModel.resourceType');
    return sidebarResources.getButtonsFor(resourcesType);
  }),

  /**
   * If true, level-0 item should present a loading state
   * @type {boolean}
   */
  isLoadingItem: reads('sidebar.isLoadingItem'),

  title: computed('resourcesModel.resourceType', function () {
    let resourcesType = this.get('resourcesModel.resourceType');
    return resourcesType;
  }),
});
