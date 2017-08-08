/**
 * A component when available login options should be presented
 *
 * @module components/login-box
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/login-box';

const {
  inject: {
    service
  },
  computed,
  computed: { 
    alias,
    readOnly,
  },
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['login-box'],

  globalNotify: service(),
  onepanelServer: service(),
  session: service(),

  isBusy: false,

  /**
   * True, if previous session has expired
   */
  sessionHasExpired: alias('session.data.hasExpired'),

  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  brandSubtitle: computed('onepanelServiceType', function () {
    let {
      i18n,
      onepanelServiceType
    } = this.getProperties('i18n', 'onepanelServiceType');
    return onepanelServiceType ?
      'One' + i18n.t(`components.brandInfo.serviceType.${onepanelServiceType}`) : null;
  }),

  actions: {
    authenticationStarted() {
      this.set('isBusy', true);
    },

    authenticationSuccess() {
      this.get('globalNotify').info('Authentication succeeded!');
      this.set('isBusy', false);
    },

    authenticationFailure() {
      this.set('isBusy', false);
    }
  }
});
