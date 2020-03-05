/**
 * Creates accordion-like list of elements. By default items can be expanded separately. 
 * If accordionMode = true then only one item can be expanded in the same time.
 * It is a contextual component - yields header and item component in hash. 
 * 
 * List items can be selected using checkbox. To enable this functionality,
 * property hasCheckboxes must be set to true for list, and each item, that can be
 * selected must have property selectionValue defined. After each selection change
 * selectionChanged action is invoked with an array of selectionValue item properties.
 * 
 * Example:
 * ```
 * {{#one-collapsible-list as |list|}}
 *   {{#list.header title="List title"}}
 *     {{#bs-button class="btn-sm" type="info"}}some button{{/bs-button}}
 *   {{/list.header}}
 *   {{#list.item as |listItem|}}
 *     {{#listItem.header}}
 *       Header (will toggle visibility of content on click).
 *     {{/listItem.header}}
 *     {{#listItem.content}}
 *       Hiddent content.
 *     {{/listItem.content}}
 *   {{/list.item}}
 *   {{!-- other items... --}}
 * {{/one-collapsible-list}}
 * ```
 *
 * @module components/one-collapsible-list.js
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed, observer } from '@ember/object';
import { debounce, next } from '@ember/runloop';
import { A } from '@ember/array';
import { invoke, invokeAction } from 'ember-invoke-action';

import layout from 'onedata-gui-common/templates/components/one-collapsible-list';

export default Component.extend({
  layout,
  tagName: 'ul',
  classNames: ['one-collapsible-list'],
  classNameBindings: ['searchQuery:filtered-list'],
  accordionMode: false,
  activeElementId: '',

  /**
   * If true, each item can be selected through checkbox
   * @type {boolean}
   */
  hasCheckboxes: false,

  /**
   * Selected items change handler
   * @type {Function}
   */
  selectionChanged: null,

  /**
   * Filtered items change handler
   * @type {Function}
   */
  filtrationChanged: () => {},

  /**
   * List collapse state change handler
   * @type {Function}
   * @param {boolean} isCollapsed
   * @returns {undefined}
   */
  listCollapsed: () => {},

  /**
   * List of selected item values
   * @type {Ember.Array.*}
   */
  _selectedItemValues: null,

  /**
   * Selection values for all list items (used to "select all" action)
   * @type {Ember.Array.*}
   */
  _availableItemValues: null,

  /**
   * If true, list is collapsed
   * @type {boolean}
   */
  isListCollapsed: false,

  /**
   * String, that is used for list items filtering
   * @type {string}
   */
  searchQuery: '',

  /**
   * If changed, triggers selection reset. Value of this property is not important
   * @type {any}
   */
  resetSelectionTrigger: undefined,

  /**
   * If true, all items are selected
   * @type {computed.boolean}
   */
  _areAllItemsSelected: computed('_selectedItemValues.length',
    '_availableItemValues.length',
    function () {
      let {
        _selectedItemValues,
        _availableItemValues,
      } = this.getProperties('_selectedItemValues', '_availableItemValues');
      return _selectedItemValues.length === _availableItemValues.length &&
        _availableItemValues.length !== 0;
    }
  ),

  resetSelectionTriggerObserver: observer(
    'resetSelectionTrigger',
    function resetSelectionTriggerObserver() {
      this.get('_selectedItemValues').clear();
    }),

  init() {
    this._super(...arguments);

    this.setProperties({
      _selectedItemValues: A(),
      _availableItemValues: A(),
    });
  },

  /**
   * Runs passed ``filtrationChanged`` action
   */
  _filtrationChanged() {
    let {
      filtrationChanged,
      _availableItemValues,
    } = this.getProperties('filtrationChanged', '_availableItemValues');
    filtrationChanged(_availableItemValues.toArray());
  },

  actions: {
    toggle(elementId) {
      if (this.get('accordionMode')) {
        if (this.get('activeElementId') === elementId) {
          this.set('activeElementId', '');
        } else {
          this.set('activeElementId', elementId);
        }
      }
    },
    toggleItemSelection(itemValue, selectionState) {
      let {
        _selectedItemValues,
        _availableItemValues,
      } = this.getProperties('_selectedItemValues', '_availableItemValues');
      let isOnList = _selectedItemValues.includes(itemValue);
      if (!selectionState && isOnList) {
        _selectedItemValues.removeObject(itemValue);
      } else if ((selectionState === undefined || selectionState === true) &&
        !isOnList && _availableItemValues.includes(itemValue)) {
        _selectedItemValues.pushObject(itemValue);
      }
      invokeAction(this, 'selectionChanged', _selectedItemValues.toArray());
    },
    notifyValue(itemValue, exists) {
      // next() to avoid multiple modification in a single render,
      // because all list items will probably notify its values in the same time
      next(() => {
        if (!this.isDestroying && !this.isDestroyed) {
          let _availableItemValues = this.get('_availableItemValues');
          let isOnList = _availableItemValues.indexOf(itemValue) > -1;
          if (exists && !isOnList) {
            _availableItemValues.pushObject(itemValue);
          } else if (!exists && isOnList) {
            _availableItemValues.removeObject(itemValue);
            invoke(this, 'toggleItemSelection', itemValue, false);
          }
          debounce(this, '_filtrationChanged', 1);
        }
      });
    },
    toggleAllItemsSelection() {
      let {
        _areAllItemsSelected,
        _availableItemValues,
        _selectedItemValues,
      } = this.getProperties(
        '_areAllItemsSelected',
        '_availableItemValues',
        '_selectedItemValues'
      );
      if (_areAllItemsSelected) {
        _selectedItemValues.clear();
      } else {
        _selectedItemValues.addObjects(_availableItemValues);
      }
      invokeAction(this, 'selectionChanged', _selectedItemValues.toArray());
    },
    collapseList(visibility) {
      if (visibility === undefined) {
        this.toggleProperty('isListCollapsed');
      } else {
        this.set('isListCollapsed', visibility);
      }
      this.get('listCollapsed')(this.get('isListCollapsed'));
    },
    search(query) {
      this.set('searchQuery', query);
    },
  },
});
