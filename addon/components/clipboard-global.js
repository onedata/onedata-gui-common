/**
 * Global component for copying to clipboard.
 *
 * @module components/clipboard-global
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import layout from '../templates/components/clipboard-global';
import CopyButton from 'onedata-gui-common/components/one-copy-button';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import _ from 'lodash';

export default CopyButton.extend(I18n, {
  layout,

  globalClipboard: service(),
  globalNotify: service(),
  i18n: service(),

  class: 'btn-global-copy-button',

  i18nPrefix: 'components.clipboardGlobal',

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  clipboardText: reads('globalClipboard.textToCopy'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  textType: reads('globalClipboard.textType'),

  actions: {
    clipboardSuccess() {
      this.get('globalNotify').success(this.t(
        'clipboardSuccess', {
          textType: _.startCase(this.get('textType')),
        }
      ));
    },
    clipboardError() {
      this.get('globalNotify').error(this.t(
        'clipboardError', {
          textType: this.get('textType'),
        }
      ));
    },
  },
});
