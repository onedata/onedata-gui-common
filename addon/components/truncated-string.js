/**
 * A component that truncates text inside it. If text is truncated, tooltip
 * with full text will be shown on hover.
 * 
 * @module components/truncated-string
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/truncated-string';

const {
  run: {
    scheduleOnce,
  },
} = Ember;

export default Ember.Component.extend({
  layout,
  tagName: 'div',
  classNames: ['truncated-string'],
  classNameBindings: ['widthBased::truncate'],

  /**
   * Should tooltip be enabled? (set by overflow detection algorithm)
   * @type {boolean}
   */
  tooltipEnabled: false,

  /**
   * If true, tooltip is visible (makes sense only if tooltipEnabled = true)
   * @type {boolean}
   */
  showTooltip: false,

  /**
   * If true, overflow element max-width will be calculated according to 
   * its parent width
   * @type {boolean}
   */
  widthBased: false,

  /**
   * Overflow element' parent selector [only for widthBased = true]
   * @type {string}
   */
  parentSelector: null,

  /**
   * Value that is subtracted from element' parent width 
   * while max-width calculation [only for widthBased = true]
   * @type {number}
   */
  shrinkBy: 0,

  /**
   * Function for updating max width
   * @private
   */
  _changeMaxWidthFun: null,

  didInsertElement() {
    this._super(...arguments);
    let {
      parentSelector,
      shrinkBy,
      widthBased
    } = this.getProperties('parentSelector', 'shrinkBy', 'widthBased');

    if (widthBased) {
      shrinkBy = shrinkBy || 0;
      scheduleOnce('afterRender', this, function () {
        let parent = parentSelector ?
          this.$().closest(parentSelector) : this.$().parent();
        let $element = this.$();
        let changeMaxWidth = ( /*event*/ ) => {
          let maxWidth = parent.width();
          $element.css({
            maxWidth: (parseInt(maxWidth) - shrinkBy)
          });
        };

        this.set('_changeMaxWidthFun', changeMaxWidth);
        $(window).resize(changeMaxWidth);
        changeMaxWidth();
        this.updateTooltipText();
      });
    }
  },

  willDestroyElement() {
    let {
      _changeMaxWidthFun,
      widthBased
    } = this.getProperties('_changeMaxWidthFun', 'widthBased');
    if (widthBased) {
      $(window).off('resize', _changeMaxWidthFun);
    }
  },

  updateTooltipText() {
    let element = !this.get('widthBased') ?
      this.$() : this.$().find('.truncated-string-content');
    this.set('tooltipText', element.text().trim());
  },

  mouseEnter() {
    let overflowElement =
      this.$('.truncate.truncated-string-content')[0] || this.$()[0];
    this.set('tooltipEnabled',
      overflowElement.offsetWidth < overflowElement.scrollWidth
    );
    this.updateTooltipText();
    this.set('showTooltip', true);
  },

  mouseLeave() {
    this.set('showTooltip', false);
  }
});
