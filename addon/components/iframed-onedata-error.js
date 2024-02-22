/**
 * Additional error message handling for top-level Onedata iframes embedded on the other
 * site as an iframe. It shows special message if the error is about routing.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/iframed-onedata-error';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  layout,
  classNames: ['iframed-onedata-error'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.iframedOnedataError',

  /**
   * @type {Error}
   * @virtual
   */
  error: undefined,

  /**
   * @type {boolean}
   */
  isRoutingError: undefined,

  init() {
    this._super(...arguments);
    if (this.error?.toString().match(/route .* was not found/)) {
      this.set('isRoutingError', true);
    }
  },
});
