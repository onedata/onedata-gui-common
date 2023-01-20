import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix } from '../commons';

export default class TimeSeriesMeasurementValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = `${editorComponentsPrefix}/time-series-measurement/editor`;
    if (!this.value) {
      this.value = {
        timestamp: Math.floor(Date.now() / 1000),
        tsName: '',
        value: 0,
      };
    }
  }
}
