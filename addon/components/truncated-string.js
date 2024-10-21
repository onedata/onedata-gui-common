/**
 * A component that truncates text inside it. If text is truncated, tooltip
 * with full text will be shown on hover.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { trySet } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/truncated-string';

export default Component.extend({
  layout,
  classNames: ['truncated-string', 'truncate'],

  /**
   * If true, do not show tooltip when text is truncated.
   * @virtual optional
   * @type {boolean}
   */
  isTooltipDisabled: false,

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
   * @type {() => void}
   */
  tooltipOnShown: undefined,

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

  /**
   * @type {(() => void) | null}
   */
  mouseEnterHandler: null,

  /**
   * @type {(() => void) | null}
   */
  mouseLeaveHandler: null,

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);

    if (!this.element) {
      return;
    }

    this.setProperties({
      mouseEnterHandler: () => {
        const { element: overflowElement } = this;
        this.updateTooltipText();
        trySet(
          this,
          'showTooltip',
          overflowElement.offsetWidth < overflowElement.scrollWidth
        );
      },
      mouseLeaveHandler: () => {
        trySet(this, 'showTooltip', false);
      },
    });
    this.element.addEventListener('mouseenter', this.mouseEnterHandler);
    this.element.addEventListener('mouseleave', this.mouseLeaveHandler);
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      if (this.mouseEnterHandler) {
        this.element?.removeEventListener('mouseenter', this.mouseEnterHandler);
      }
      if (this.mouseLeaveHandler) {
        this.element?.removeEventListener('mouseleave', this.mouseLeaveHandler);
      }
    } finally {
      this._super(...arguments);
    }
  },

  updateTooltipText() {
    trySet(
      this,
      'tooltipText',
      this.element?.textContent.trim()
    );
  },

  actions: {
    handleTooltipShown() {
      this.tooltipOnShown?.();
    },
  },
});
