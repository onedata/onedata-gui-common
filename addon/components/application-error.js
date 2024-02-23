/**
 * A resource loading error message intended to use on whole application screen
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/application-error';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import isCrossOriginIframe from 'onedata-gui-websocket-client/utils/is-cross-origin-iframe';

export default Component.extend(I18n, {
  layout,
  classNames: ['application-error'],

  i18n: service(),
  errorExtractor: service(),

  i18nPrefix: 'components.applicationError',

  /**
   * An object with error details, that should be parseable by getErrorDetails
   * @virtual
   * @type {object}
   */
  error: undefined,

  /**
   * @virtual
   * One of: default, internal
   */
  messageType: 'default',

  message: computed('messageType', function message() {
    return this.t('messages.' + this.get('messageType'));
  }),

  /**
   * Displayed error details generated from reason error object
   * @type {string}
   */
  reasonDetails: computed('error', function reasonDetails() {
    const {
      error,
      errorExtractor,
    } = this.getProperties('error', 'errorExtractor');
    return error && errorExtractor.getMessage(error);
  }),

  isCrossOriginIframeRoutingError: computed(function isCrossOriginIframeRoutingError() {
    return isCrossOriginIframe() &&
      this.error?.toString().match(/route .* was not found/);
  }),
});
