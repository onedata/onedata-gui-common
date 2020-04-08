/**
 * A service which provides cluster manipulation functions ready to use for GUI 
 *
 * @module services/cluster-actions
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { collect } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Service.extend(I18n, {
  router: service(),
  i18n: service(),

  i18nPrefix: 'services.clusterActions',

  /**
   * @type {Ember.Computed<Array<SidebarButtonDefinition>>}
   */
  buttons: collect('btnAdd'),

  addAction: computed(function addAction() {
    const router = this.get('router');
    return () => router.transitionTo('onedata.sidebar.content', 'clusters', 'add');
  }),

  btnAdd: computed('addAction', function btnAdd() {
    return {
      icon: 'add-filled',
      title: this.t('btnAdd.title'),
      tip: this.t('btnAdd.hint'),
      class: 'add-cluster-btn',
      action: this.get('addAction'),
    };
  }),
});
