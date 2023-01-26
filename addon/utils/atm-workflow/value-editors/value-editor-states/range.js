/**
 * Range value editor state.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix } from '../commons';

export default class RangeValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = `${editorComponentsPrefix}/range/editor`;
    if (!this.value) {
      this.value = {
        start: 0,
        end: 1,
        step: 1,
      };
    }
  }
}
