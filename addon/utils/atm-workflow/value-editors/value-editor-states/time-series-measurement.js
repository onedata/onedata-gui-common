/**
 * Time series measurement value editor state.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix } from '../common';

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
