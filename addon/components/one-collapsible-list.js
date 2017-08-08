import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/one-collapsible-list';

/**
 * Creates accordion-like list of elements. By default items can be expanded separately. 
 * If accordionMode = true then only one item can be expanded in the same time.
 * It is a contextual component - yields item component in hash. 
 * Lists can be nested.
 * 
 * Example:
 * ```
 * {{#one-collapsible-list as |list|}}
 *   {{#list.item as |listItem|}}
 *     {{#listItem.header}}
 *       Header (will toggle visibility of content on click).
 *     {{/listItem.header}}
 *     {{#listItem.content}}
 *       Hiddent content.
 *     {{/listItem.content}}
 *   {{/listItem}}
 *   {{!-- other items... --}}
 * {{/one-collapsible-list}}
 * ```
 *
 * @module components/one-collapsible-list.js
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  layout,
  tagName: 'ul',
  classNames: ['one-collapsible-list'],
  accordionMode: false,
  activeElementId: '',

  actions: {
    toggle(elementId) {
      if (this.get('accordionMode')) {
        if (this.get('activeElementId') === elementId) {
          this.set('activeElementId', '');
        } else {
          this.set('activeElementId', elementId);
        }
      }
    }
  }
});
