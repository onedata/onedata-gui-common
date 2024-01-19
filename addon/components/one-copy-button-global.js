/**
 * Global component for copying to clipboard.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import layout from 'onedata-gui-common/templates/components/one-copy-button-global';

export default Component.extend({
  tagName: '',
  layout,

  globalClipboard: service(),

  /**
   * @type {ComputedProperty<string | undefined>}
   */
  clipboardText: reads('globalClipboard.textToCopy'),

  /**
   * @type {ComputedProperty<string | undefined>}
   */
  textType: reads('globalClipboard.textType'),

  actions: {
    copyEnded() {
      this.globalClipboard.endCopy();
    },
  },
});
