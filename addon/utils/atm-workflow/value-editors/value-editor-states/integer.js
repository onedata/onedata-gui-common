import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix } from '../commons';

export default class IntegerValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = `${editorComponentsPrefix}/integer/editor`;
  }
}
