import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix } from '../commons';

export default class BooleanValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = `${editorComponentsPrefix}/boolean/editor`;
    if (typeof this.value !== 'boolean') {
      this.value = false;
    }
  }
}
