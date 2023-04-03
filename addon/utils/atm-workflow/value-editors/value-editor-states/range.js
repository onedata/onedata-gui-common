/**
 * Range value editor state.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix } from '../common';

export default class RangeValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = `${editorComponentsPrefix}/range/editor`;
  }

  /**
   * @override
   */
  setValue(newValue) {
    // Code below checks if passed value looks like an incomplete range (without
    // "start" and/or "step" field) and in that case assigns default values to
    // the missing fields.

    if (typeof newValue !== 'object' || !newValue) {
      super.setValue(newValue);
      return;
    }

    const normalizedValue = { ...newValue };
    if (normalizedValue.start === undefined) {
      normalizedValue.start = 0;
    }
    if (normalizedValue.start === undefined) {
      normalizedValue.step = 1;
    }

    super.setValue(normalizedValue);
  }
}
