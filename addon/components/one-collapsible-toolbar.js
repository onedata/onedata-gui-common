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
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed, observer } from '@ember/object';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/one-collapsible-toolbar';
import ClickOutside from 'ember-click-outside/mixin';
import ContentOverflowDetector from 'onedata-gui-common/mixins/content-overflow-detector';
import $ from 'jquery';

export default Component.extend(ClickOutside, ContentOverflowDetector, {
  layout,
  classNames: ['one-collapsible-toolbar'],
  classNameBindings: [
    'stateClasses',
    'isInternallyMinimized:minimized',
    'dropdownOpened',
  ],

  eventsBus: service(),

  /**
   * Optional to inject.
   * Additional class for toggle.
   * @type {string}
   */
  toggleBtnClass: '',

  /**
   * @virtual optional
   * @type {String}
   */
  popoverClass: '',

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

  /**
   * @type {number}
   */
  minimumFullWindowSize: 768,

  /**
   * @type {boolean}
   */
  isMinimized: undefined,

  /**
   * @type {boolean}
   */
  dropdownOpened: false,

  /**
   * @type {string}
   */
  dropdownPlacement: 'bottom-left',

  /**
   * If true, then all toolbar elements will be rendered immediately
   * (by default are rendered on-demand).
   * @type {boolean}
   */
  renderImmediately: false,

  /**
   * @type {boolean}
   */
  dropdownOverModals: false,

  /**
   * Combined value of isMinimized and hasOverflow
   * @type {Ember.ComputedProperty<boolean>}
   */
  isInternallyMinimized: computed('isMinimized', 'hasOverflow', function () {
    const {
      isMinimized,
      hasOverflow,
    } = this.getProperties('isMinimized', 'hasOverflow');
    return isMinimized === undefined ? hasOverflow : isMinimized;
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  stateClasses: computed(
    'isInternallyMinimized',
    'fullModeClasses',
    'minimizedModeClasses',
    function () {
      const {
        isInternallyMinimized,
        fullModeClasses,
        minimizedModeClasses,
      } = this.getProperties(
        'isInternallyMinimized',
        'fullModeClasses',
        'minimizedModeClasses');
      return isInternallyMinimized ? minimizedModeClasses : fullModeClasses;
    }
  ),

  overflowDetectorMounter: observer('isMinimized', function overflowDetectorMounter() {
    if (this.get('isMinimized')) {
      this.detachOverflowDetection();
    } else {
      this.attachOverflowDetection();
    }
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
      overflowElement: $(this.element.querySelector('.collapsible-toolbar-buttons')),
      overflowParentElement: $(this.element.parentElement),
      overflowSiblingsElements: $(this.element).siblings(),
    });
    this.overflowDetectorMounter();
    this.get('eventsBus').on(
      'one-inline-editor:resize',
      () => this.get('_overflowDetectionListener')()
    );
  },

  willDestroyElement() {
    this._super(...arguments);
    this.removeClickOutsideListener();
    this.detachOverflowDetection();
    this.get('eventsBus').off('one-inline-editor:resize');
  },

  attachOverflowDetection() {
    this.removeOverflowDetectionListener();
    this.addOverflowDetectionListener();
    this.get('_overflowDetectionListener')();
  },

  detachOverflowDetection() {
    this.removeOverflowDetectionListener();
  },

  clickOutside(event) {
    const {
      toggleSelector,
      elementId,
    } = this.getProperties('toggleSelector', 'elementId');

    if (!event.target.closest(toggleSelector + ', .popover-' + elementId)) {
      this.set('dropdownOpened', false);
    }
  },

  actions: {
    closeDropdown() {
      this.set('dropdownOpened', false);
    },
    toggleDropdown() {
      this.toggleProperty('dropdownOpened');
    },
  },
});
