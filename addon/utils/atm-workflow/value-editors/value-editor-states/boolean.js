/**
 * Boolean value editor state.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix } from '../common';

export default class BooleanValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = `${editorComponentsPrefix}/boolean/editor`;
  }
}
