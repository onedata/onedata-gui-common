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
