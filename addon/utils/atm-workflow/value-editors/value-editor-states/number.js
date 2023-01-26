import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix } from '../commons';

export default class NumberValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = `${editorComponentsPrefix}/number/editor`;
  }
}
