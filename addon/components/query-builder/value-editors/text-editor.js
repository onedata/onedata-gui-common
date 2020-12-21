/**
 * Allows to edit query text values.
 *
 * @module components/query-builder/value-editors/text-editor
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import EditorBaseComponent from 'onedata-gui-common/components/query-builder/value-editors/-base-editor';

export default EditorBaseComponent.extend({
  tagName: 'input',
  attributeBindings: ['type', 'value'],
  classNames: ['text-editor', 'form-control', 'form-control-sm'],
  classNameBindings: ['isValueInvalid:is-invalid'],

  /**
   * Input type attribute
   * @type {String}
   */
  type: 'text',

  /**
   * @type {ComputedProperty<Function>}
   */
  blurHandler: computed(function blurHandler() {
    return () => this.get('onFinishEdit')();
  }),

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    const element = this.get('element');
    element.focus();
    element.select();
    this.registerEventHandlers();
  },

  /**
   * @override
   */
  willDestroyElement() {
    this.deregisterEventHandlers();
  },

  /**
   * @override
   * @param {KeyboardEvent} event 
   */
  keyDown(event) {
    if (event.key === 'Enter') {
      this.get('onFinishEdit')();
    } else if (event.key === 'Escape') {
      this.get('onCancelEdit')();
    }
  },

  /**
   * @override
   * @param {InputEvent} event 
   */
  input(event) {
    const value = event.currentTarget.value;
    this.get('onValueChange')(value);
  },

  registerEventHandlers() {
    const {
      element,
      blurHandler,
    } = this.getProperties('element', 'blurHandler');
    element.addEventListener('blur', blurHandler);
  },

  deregisterEventHandlers() {
    const {
      element,
      blurHandler,
    } = this.getProperties('element', 'blurHandler');
    element.removeEventListener('blur', blurHandler);
  },
});
