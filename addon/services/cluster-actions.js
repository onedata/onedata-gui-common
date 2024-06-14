/**
 * A service which provides cluster manipulation functions ready to use for GUI
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Service.extend(I18n, {
  router: service(),
  i18n: service(),

  i18nPrefix: 'services.clusterActions',

  /**
   * @returns {Ember.Computed<Array<SidebarButtonDefinition>>}
   */
  createGlobalActions() {
    return [this.createAddButton()];
  },

  createAddButton() {
    return {
      icon: 'add-filled',
      title: this.t('btnAdd.title'),
      tip: this.t('btnAdd.hint'),
      class: 'add-cluster-btn',
      action: () =>
        this.router.transitionTo('onedata.sidebar.content', 'clusters', 'add'),
    };
  },
});
