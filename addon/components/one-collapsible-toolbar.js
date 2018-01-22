/**
 * Component for dynamic resizable button toolbars. 
 * When there is not enough space for a standard toolbar, 
 * it collapses to one button with popover menu.
 * 
 * It can work in two possible modes:
 * - standard (field isGlobal = false) [default] when toolbar collapses, 
 * popover trigger is placed in the same place, where toolbar was.
 * - global (field isGlobal = true) when toolbar collapses, popover 
 * is mounted on the element specified by GlobalCollapsibleToolbar.toggleClassName 
 * CSS-classname. There can be only one active global toolbar 
 * in the same time.
 * 
 * Example:
 * ```
 * {{#one-collapsible-toolbar isGlobal=true as |dropdown|}}
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
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import layout from 'onedata-gui-common/templates/components/one-collapsible-toolbar';
import ClickOutside from 'ember-click-outside/mixins/click-outside';
import ContentOverflowDetector from 'onedata-gui-common/mixins/content-overflow-detector';

export default Component.extend(ClickOutside, ContentOverflowDetector, {
  layout,
  classNames: ['one-collapsible-toolbar'],
  classNameBindings: ['stateClasses', 'isMinimized:minimized'],

  globalCollapsibleToolbar: service(),

  /**
   * Optional to inject.
   * Additional class for toggle.
   * @type {string}
   */
  toggleBtnClass: '',

  /**
   * Is that collapsible-toolbar a global toolbar?
   * There can be only one such a toolbar in the same time.
   * @type {boolean}
   */
  isGlobal: false,

  /**
   * CSS classes used in full mode (for a whole toolbar)
   * @type {boolean}
   */
  fullModeClasses: 'btn-toolbar',

  /**
   * CSS classes used in minimized mode (for a dropdown trigger)
   * @type {boolean}
   */
  minimizedModeClasses: '',

  minimumFullWindowSize: 768,

  isMinimized: oneWay('hasOverflow'),

  _internalDropdownOpened: false,
  dropdownOpened: computed('isGlobal', 'globalCollapsibleToolbar.isDropdownOpened', {
    get() {
      let {
        isGlobal,
        globalCollapsibleToolbar,
        _internalDropdownOpened,
      } = this.getProperties('isGlobal', 'globalCollapsibleToolbar',
        '_internalDropdownOpened');
      if (!isGlobal) {
        return _internalDropdownOpened;
      } else {
        return globalCollapsibleToolbar.get('isDropdownOpened');
      }
    },
    set(key, value) {
      let {
        isGlobal,
        globalCollapsibleToolbar,
      } = this.getProperties('isGlobal', 'globalCollapsibleToolbar');
      if (isGlobal) {
        globalCollapsibleToolbar.set('isDropdownOpened', value);
      } else {
        this.set('_internalDropdownOpened');
      }
      return value;
    }
  }),

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

  toggleSelector: computed('isGlobal', 'elementId',
    'globalCollapsibleToolbar.toggleClassName',
    function () {
      let {
        isGlobal,
        elementId,
        globalCollapsibleToolbar

      } = this.getProperties('isGlobal', 'elementId', 'globalCollapsibleToolbar');
      if (isGlobal) {
        return '.' + globalCollapsibleToolbar.get('toggleClassName');
      } else {
        return '#' + elementId + ' .collapsible-toolbar-toggle';
      }
    }),

  didInsertElement() {
    this._super(...arguments);
    let {
      isGlobal,
      showInMobileSidebar,
      globalCollapsibleToolbar,
    } = this.getProperties(
      'isGlobal',
      'globalCollapsibleToolbar',
      'showInMobileSidebar'
    );
    if (isGlobal) {
      globalCollapsibleToolbar.set('isToggleVisible', true);
    }
    globalCollapsibleToolbar.set('showInMobileSidebar', !!showInMobileSidebar);
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
  },

  didDestroyElement() {
    this._super(...arguments);
    let {
      isGlobal,
      globalCollapsibleToolbar,
      showInMobileSidebar,
    } = this.getProperties(
      'isGlobal',
      'globalCollapsibleToolbar',
      'showInMobileSidebar'
    );
    if (isGlobal) {
      globalCollapsibleToolbar.set('isToggleVisible', false);
    }
    globalCollapsibleToolbar.set('showInMobileSidebar', !!showInMobileSidebar);
    this.removeClickOutsideListener();
    this.removeOverflowDetectionListener();
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
