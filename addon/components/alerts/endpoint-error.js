/**
 * Content for alert modal showing error reaching endpoint
 * 
 * @module components/alerts/endpoint-error
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/alerts/endpoint-error';

export default Component.extend(I18n, {
  tagName: '',
  layout,

  i18nPrefix: 'components.alerts.endpointError',

  /**
   * @override
   * @type {object}
   */
  options: undefined,

  /**
   * One of: oneprovider, onepanel
   * @type {ComputedProperty<string>}
   */
  serverType: reads('options.serverType'),

  /**
   * Typically an API origin of Onepanel or Oneprovider
   * @type {ComputedProperty<string>}
   */
  connectionUrl: computed('options.url', 'serverType', function url() {
    const serverType = this.get('serverType');
    let displayUrl = this.get('options.url');
    if (serverType === 'onepanel') {
      displayUrl += '/api/v3/onepanel';
    }
    return displayUrl;
  }),

  tlsUrl: reads('options.url'),
});
