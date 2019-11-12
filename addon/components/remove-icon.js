/**
 * Renders icon that can be used to delete entities.
 *
 * @module components/remove-icon
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/remove-icon';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  layout,
  classNames: ['remove-icon'],
  classNameBindings: ['isDisabled:disabled:enabled'],

  /**
   * @virtual optional
   * @type {boolean}
   */
  isDisabled: false,

  /**
   * @virtual optional
   * @type {string|undefined}
   */
  tooltipText: undefined,

  /**
   * @virtual optional
   * @type {Function}
   */
  onClick: notImplementedIgnore,

  click() {
    const {
      isDisabled,
      onClick,
    } = this.getProperties('isDisabled', 'onClick');
    if (!isDisabled) {
      onClick();
    }
  },
});
