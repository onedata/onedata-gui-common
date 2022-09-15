/**
 * A component that truncates text inside it. If text is truncated, tooltip
 * with full text will be shown on hover.
 *
 * @module components/truncated-string
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/truncated-string';

export default Component.extend({
  layout,
  classNames: ['truncated-string', 'truncate'],

  /**
   * If provided, tooltip will render this text content instead of block text content.
   * @virtual optional
   * @type {string|SafeString}
   */
  customTooltipText: undefined,

  /**
   * Placement of popover with full text.
   * See Bootstrap 3 docs for available values.
   * @virtual optional
   * @type {string}
   */
  tooltipPlacement: 'top',

  /**
   * @virtual optional
   * @type {string}
   */
  tooltipClass: '',

  /**
   * @type {string}
   */
  tooltipText: undefined,

  /**
   * If true, tooltip is visible
   * @type {boolean}
   */
  showTooltip: false,

  mouseEnter() {
    this.updateTooltipText();

    const overflowElement = this.get('element');
    this.set('showTooltip', overflowElement.offsetWidth < overflowElement.scrollWidth);
  },

  mouseLeave() {
    this.set('showTooltip', false);
  },

  updateTooltipText() {
    this.set('tooltipText', this.get('element').textContent.trim());
  },
});
