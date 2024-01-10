/**
 * Renders warning icon with optional tooltip.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/warning-icon';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['warning-icon'],

  /**
   * @virtual optional
   * @type {string | null}
   */
  tooltipText: null,
});
