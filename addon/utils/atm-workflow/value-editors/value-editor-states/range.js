import ValueEditorState from './value-editor-state';

export default class RangeValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = 'atm-workflow/value-editors/range/editor';
    if (!this.value) {
      this.value = {
        start: 0,
        end: 1,
        step: 1,
      };
    }
  }
}
