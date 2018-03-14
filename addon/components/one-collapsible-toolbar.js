/**
 * Component for dynamic resizable button toolbars. 
 * When there is not enough space for a standard toolbar, 
 * it collapses to one button with popover menu.
 * 
 * Example:
 * ```
 * {{#one-collapsible-toolbar as |dropdown|}}
 *   {{#dropdown.item buttonStyle="danger" triggerClasses="btn-1" closeOnAction=false}}
 *     Button 1
 *   {{/dropdown.item}}
 *   {{#dropdown.item itemAction=(action "someActionOnItemClick")}}
 *     Button 2
 *   {{/dropdown.item}}
 * {{/one-collapsible-toolbar}}
 * ```
 *
 * @module components/one-collapsible-toolbar
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
import { oneWay } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/one-collapsible-toolbar';
import ClickOutside from 'ember-click-outside/mixins/click-outside';
import ContentOverflowDetector from 'onedata-gui-common/mixins/content-overflow-detector';
import $ from 'jquery';

export default Component.extend(ClickOutside, ContentOverflowDetector, {
  layout,
  classNames: ['one-collapsible-toolbar'],
  classNameBindings: ['stateClasses', 'isMinimized:minimized'],

  eventsBus: service(),

  /**
   * Optional to inject.
   * Additional class for toggle.
   * @type {string}
   */
  toggleBtnClass: '',

  /**
   * CSS classes used in full mode (for a whole toolbar)
   * @type {boolean}
   */
  fullModeClasses: 'btn-toolbar',

  /**
   * If true, in minimized mode "three dots" menu trigger will be visible
   * @type {boolean}
   */
  showMinimized: true,

  /**
   * CSS classes used in minimized mode (for a dropdown trigger)
   * @type {boolean}
   */
  minimizedModeClasses: '',

  minimumFullWindowSize: 768,

  isMinimized: oneWay('hasOverflow'),

  dropdownOpened: false,

  stateClasses: computed(
    'isMinimized',
    'fullModeClasses',
    'minimizedModeClasses',
    function () {
      let {
        isMinimized,
        fullModeClasses,
        minimizedModeClasses
      } = this.getProperties(
        'isMinimized',
        'fullModeClasses',
        'minimizedModeClasses');
      return isMinimized ? minimizedModeClasses : fullModeClasses;
    }),

  didInsertElement() {
    this._super(...arguments);
    next(this, () => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      this.addClickOutsideListener();
    });
    this.setProperties({
      overflowElement: this.$('.collapsible-toolbar-buttons'),
      overflowParentElement: this.$().parent(),
      overflowSiblingsElements: this.$().siblings()
    });
    this.addOverflowDetectionListener();
    this.get('eventsBus').on(
      'one-inline-editor:resize',
      () => this.get('_overflowDetectionListener')()
    );
  },

  didDestroyElement() {
    this._super(...arguments);
    this.removeClickOutsideListener();
    this.removeOverflowDetectionListener();
    this.get('eventsBus').off('one-inline-editor:resize');
  },

  clickOutside(event) {
    let {
      toggleSelector,
      elementId,
    } = this.getProperties('toggleSelector', 'elementId');
    let clickTarget = $(event.target);
    if (!clickTarget.is(toggleSelector) &&
      clickTarget.parents(toggleSelector + ', .popover-' + elementId).length === 0) {
      this.set('dropdownOpened', false);
    }
  },

  actions: {
    closeDropdown() {
      this.set('dropdownOpened', false);
    },
    toggleDropdown() {
      let toggle = this.$('.collapsible-toolbar-toggle');
      let popoverOpened = toggle.attr('data-target') &&
        $('#' + toggle.attr('data-target')).hasClass('in');
      if (this.get('dropdownOpened') && !popoverOpened) {
        // Popover has been closed from the outside. schedule its reopen
        next(() => this.toggleProperty('dropdownOpened'));
      }
      this.toggleProperty('dropdownOpened');
    }
  },
});
