/**
 * Shows modal asking about ceasing support of Oneprovider from space
 *
 * @module components/cease-oneprovider-support-modal
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/cease-oneprovider-support-modal';

export default Component.extend(I18n, {
  layout,
  tagName: '',

  spaceManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.ceaseOneproviderSupportModal',

  /**
   * @virtual
   * @type {boolean}
   */
  opened: false,

  /**
   * @virtual
   * @type {Models.Space}
   */
  space: undefined,

  /**
   * @virtual
   * @type {Models.Provider}
   */
  provider: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  proceed: notImplementedReject,

  /**
   * @virtual
   * @type {Function}
   */
  close: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onHidden: notImplementedIgnore,

  /**
   * True if proceed action started and not resolved/rejected yet
   * @type {boolean}
   */
  processing: false,

  /**
   * True if "risk understand" checkbox is checked
   * @type {boolean}
   */
  confirmChecked: false,

  actions: {
    proceed() {
      this.set('processing', true);
      this.get('proceed')();
    },
    close() {
      return this.get('close')();
    },
    onHidden() {
      this.set('confirmChecked', false);
      return this.get('onHidden')();
    },
  },
});
