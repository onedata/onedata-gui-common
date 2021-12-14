import Component from '@ember/component';
import { notEmpty } from '@ember/object/computed';
import { observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/one-collapsible-list-item';

/**
 * Item class of the collapsible list. For example of use case see
 * components/one-collapsible-list.js.
 *
 * If isCollapsible == false then item cannot be toggled.
 * Item closes its content if eventsBus triggers closeEventName event
 *
 * @module components/one-collapsible-list-item.js
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  layout,
  tagName: 'li',
  classNames: ['one-collapsible-list-item', 'collapse-animation', 'collapse-medium'],
  classNameBindings: [
    'isActive:active',
    '_isItemCollapsed:collapse-hidden',
    '_isSelected:selected',
  ],

  eventsBus: service(),

  isCollapsible: true,
  accordionMode: false,
  activeElementId: '',
  closeEventName: null,

  /**
   * Value, that will be returned by one-collapsible-list on this item select
   * @type {*}
   */
  selectionValue: null,

  /**
   * Item selection change handler. Injected by one-collapsible-list.
   * @type {Function}
   */
  toggleItemSelection: null,

  /**
   * List of selected list items
   * @type {Array.*}
   */
  _selectedItemValues: Object.freeze([]),

  /**
   * If true, item has a checkbox
   * @type {boolean}
   */
  _hasCheckbox: false,

  /**
   * Item value notification handler. Sends to parent value of this item.
   * @type {Function}
   */
  _notifyValue: null,

  /**
   * If true, list is collapsed
   * @type {boolean}
   */
  _isListCollapsed: false,

  /**
   * Search query
   * @type {string}
   */
  _searchQuery: '',

  /**
   * If true, list item matches searched text
   * @type {boolean}
   */
  _matchesSearchQuery: true,

  /**
   * @type {any}
   */
  oldSelectionValue: null,

  _isItemCollapsed: computed('_isListCollapsed', '_matchesSearchQuery',
    '_isSelected',
    function () {
      let {
        _isListCollapsed,
        _matchesSearchQuery,
        _isSelected,
      } = this.getProperties(
        '_isListCollapsed',
        '_matchesSearchQuery',
        '_isSelected'
      );
      return _isListCollapsed || (!_matchesSearchQuery && !_isSelected);
    }
  ),

  _isItemFixed: computed('_matchesSearchQuery', '_isSelected', function () {
    let {
      _matchesSearchQuery,
      _isSelected,
    } = this.getProperties('_matchesSearchQuery', '_isSelected');
    return !_matchesSearchQuery && _isSelected;
  }),

  isActive: computed('activeElementId', 'accordionMode', function () {
    let {
      activeElementId,
      elementId,
    } = this.getProperties([
      'activeElementId', 'elementId',
    ]);
    if (this.get('accordionMode')) {
      return activeElementId === elementId;
    }
  }),

  _isSelected: computed('_selectedItemValues.[]', 'selectionValue', function () {
    let {
      _selectedItemValues,
      selectionValue,
    } = this.getProperties('_selectedItemValues', 'selectionValue');
    return _selectedItemValues.indexOf(selectionValue) > -1;
  }),

  _isCheckboxActive: notEmpty('selectionValue'),

  _searchQueryObserver: observer('_searchQuery', function () {
    this._checkSearchQuery();
  }),

  _matchesSearchQueryAndIsSelectedObserver: observer('_matchesSearchQuery',
    '_isSelected',
    function () {
      let {
        _matchesSearchQuery,
        _isSelected,
        selectionValue,
      } = this.getProperties(
        '_matchesSearchQuery',
        '_isSelected',
        'selectionValue'
      );
      // Add/remove item value from list after filter
      if (selectionValue !== null) {
        if (!_matchesSearchQuery && !_isSelected) {
          this.notifySelectionValue(selectionValue, false);
        } else if (_matchesSearchQuery) {
          this.notifySelectionValue(selectionValue, true);
        }
      }
    }
  ),

  selectionValueObserver: observer(
    'selectionValue',
    function selectionValueObserver() {
      const {
        oldSelectionValue,
        selectionValue,
      } = this.getProperties('oldSelectionValue', 'selectionValue');
      if (oldSelectionValue !== selectionValue && oldSelectionValue) {
        this.notifySelectionValue(oldSelectionValue, false);
      }
      if (selectionValue) {
        this.notifySelectionValue(selectionValue, true);
      }
      this.set('oldSelectionValue', selectionValue);
    }
  ),

  init() {
    this._super(...arguments);
    let {
      closeEventName,
      eventsBus,
      selectionValue,
    } = this.getProperties('closeEventName', 'eventsBus', 'selectionValue');
    if (closeEventName) {
      eventsBus.on(closeEventName, () => this.set('isActive', false));
    }
    if (selectionValue !== null) {
      this.set('oldSelectionValue', selectionValue);
      this.notifySelectionValue(selectionValue, true);
    }
  },

  willDestroyElement() {
    try {
      const {
        closeEventName,
        selectionValue,
        eventsBus,
      } = this.getProperties('closeEventName', 'selectionValue', 'eventsBus');
      if (selectionValue !== null) {
        this.notifySelectionValue(selectionValue, false);
      }
      if (closeEventName) {
        eventsBus.off(closeEventName);
      }
    } finally {
      this._super(...arguments);
    }
  },

  notifySelectionValue(itemValue, exists) {
    const _notifyValue = this.get('_notifyValue');
    if (_notifyValue) {
      _notifyValue(itemValue, exists);
    }
  },

  _checkSearchQuery() {
    let {
      _searchQuery,
      _matchesSearchQuery,
    } = this.getProperties('_searchQuery', '_matchesSearchQuery');
    let headerTextElement = this.$('.one-collapsible-list-item-header');
    let oneLabel = headerTextElement.find('.one-label');
    let targetElement = oneLabel.length ? oneLabel : headerTextElement;
    let matches = targetElement.text().toLowerCase()
      .search(_searchQuery.trim().toLowerCase()) > -1;
    if (matches !== _matchesSearchQuery && !matches) {
      this.send('toggle', false);
    }
    this.set('_matchesSearchQuery', matches);
  },

  actions: {
    toggle(opened) {
      if (!this.get('isCollapsible')) {
        return;
      }
      const {
        toggle,
        elementId,
        accordionMode,
      } = this.getProperties('toggle', 'elementId', 'accordionMode');
      if (accordionMode) {
        if (toggle) {
          toggle(elementId, opened);
        }
      } else {
        if (opened !== undefined) {
          this.set('isActive', !!opened);
        } else {
          this.toggleProperty('isActive');
        }
      }
    },
    toggleSelection() {
      const {
        selectionValue,
        toggleItemSelection,
      } = this.getProperties('selectionValue', 'toggleItemSelection');
      if (selectionValue !== null && toggleItemSelection) {
        toggleItemSelection(selectionValue);
      }
    },
  },
});
