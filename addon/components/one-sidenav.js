/**
 * Application side menu component.
 *
 * @module components/one-sidenav
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { scheduleOnce } from '@ember/runloop';
import { htmlSafe } from '@ember/string';
import { observer } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/one-sidenav';
import $ from 'jquery';

export default Component.extend({
  layout,
  classNames: ['one-sidenav', 'sidenav'],
  classNameBindings: ['opened:in'],
  attributeBindings: ['style'],

  /**
   * @type {boolean}
   */
  opened: false,

  /**
   * @type {Ember.String.HtmlSafe}
   */
  style: htmlSafe(''),

  openedObserver: observer('opened', function () {
    this.updatePosition(this.get('opened'));
  }),

  didInsertElement() {
    let coverSelector = this.get('coverSelector');
    scheduleOnce('afterRender', this, function () {
      this.set('$coverElement', $(coverSelector));
      $(window).on(
        'resize.' + this.elementId,
        () => this.updatePosition(this.get('opened'))
      );
      this.updatePosition(this.get('opened'));
    });
  },

  willDestroyElement() {
    $(window).off('.' + this.elementId);
  },

  updatePosition(open) {
    let $coverElement = this.get('$coverElement');
    let left = $coverElement.offset().left;
    let width = open ? $coverElement.width() : 0;
    this.set('style', htmlSafe(`left: ${left}px; width: ${width}px;`));
    this.$('.sidenav-content-container').width(width);
  },
});
