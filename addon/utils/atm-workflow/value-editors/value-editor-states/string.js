import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix } from '../commons';

export default class StringValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = `${editorComponentsPrefix}/string/editor`;
    if (!this.value) {
      this.value = '';
    }
  }
}
