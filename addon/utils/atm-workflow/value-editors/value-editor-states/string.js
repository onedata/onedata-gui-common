import ValueEditorState from './value-editor-state';

export default class StringValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = 'atm-workflow/value-editors/string/editor';
    if (!this.value) {
      this.value = '';
    }
  }
}
