import ValueEditorState from './value-editor-state';

export default class IntegerValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = 'atm-workflow/value-editors/integer/editor';
  }
}
