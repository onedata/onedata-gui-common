/**
 * A popover with question asking user whether or not to remove some element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/remove-ack-popover';

export default Component.extend(I18n, {
  layout,
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.removeAckPopover',

  /**
   * @virtual
   * @type {string}
   */
  triggerSelector: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isOpened: undefined,

  /**
   * @virtual
   * @type {string}
   */
  question: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onConfirm: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onClose: undefined,

  actions: {
    confirm() {
      this.onConfirm?.();
    },
    close() {
      this.onClose?.();
    },
  },
});
