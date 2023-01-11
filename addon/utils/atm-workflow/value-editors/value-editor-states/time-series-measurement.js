import ValueEditorState from './value-editor-state';

export default class TimeSeriesMeasurementValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = 'atm-workflow/value-editors/time-series-measurement/editor';
    if (!this.value) {
      this.value = {
        timestamp: Math.floor(Date.now() / 1000),
        tsName: '',
        value: 0,
      };
    }
  }
}
