/**
 * Object value editor state.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix } from '../common';

export default class ObjectValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = `${editorComponentsPrefix}/object/editor`;
  }

  /**
   * @public
   * @returns {string}
   */
  get editableValue() {
    return this.internalValue;
  }

  /**
   * @public
   * @param {string} newValue
   * @returns {string}
   */
  set editableValue(newValue) {
    this.internalValue = newValue;
    this.notifyChange();
  }

  /**
   * @override
   */
  getValue() {
    try {
      return JSON.parse(this.internalValue);
    } catch {
      return null;
    }
  }

  /**
   * @override
   */
  setValue(newValue) {
    this.internalValue = JSON.stringify(newValue, null, 2);
  }
}
