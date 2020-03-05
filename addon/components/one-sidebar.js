/**
 * A general layout of sidebar and container for sidebar content
 *
 * @module components/one-sidebar
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/one-sidebar';

export default Component.extend({
  layout,
  classNames: ['one-sidebar'],
  classNameBindings: [
    'isLoadingItem:loading-item',
  ],

  navigationState: service(),
  sidebarResources: service(),
  i18n: service(),

  resourcesModel: null,

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
  isLoadingItem: reads('navigationState.isActiveResourceLoading'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  title: computed('resourcesModel.resourceType', function title() {
    const resourcesType = this.get('resourcesModel.resourceType');
    return resourcesType ?
      this.get('i18n').t(`tabs.${resourcesType}.menuItem`) : '';
  }),
});
