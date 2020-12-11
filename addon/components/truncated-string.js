/**
 * A component that truncates text inside it. If text is truncated, tooltip
 * with full text will be shown on hover.
 * 
 * @module components/truncated-string
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/truncated-string';

export default Component.extend({
  layout,
  classNames: ['truncated-string', 'truncate'],

  /**
   * If true, tooltip is visible
   * @type {boolean}
   */
  showTooltip: false,

  /**
   * @type {string}
   */
  tooltipText: undefined,

  /**
   * Placement of popover with full text.
   * See one-webui-popover docs for available values.
   * @type {string}
   */
  tooltipPlacement: 'top',

  mouseEnter() {
    this.updateTooltipText();

    const overflowElement = this.get('element');
    this.set('showTooltip', overflowElement.offsetWidth < overflowElement.scrollWidth);
  },

  mouseLeave() {
    this.set('showTooltip', false);
  },

  updateTooltipText() {
    this.set('tooltipText', this.$().text().trim());
  },
});
