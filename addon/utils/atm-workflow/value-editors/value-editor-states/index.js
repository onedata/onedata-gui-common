/**
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import ArrayValueEditorState from './array';
import BooleanValueEditorState from './boolean';
import DatasetValueEditorState from './dataset';
import FileValueEditorState from './file';
import NumberValueEditorState from './number';
import ObjectValueEditorState from './object';
import RangeValueEditorState from './range';
import StringValueEditorState from './string';
import TimeSeriesMeasurementValueEditorState from './time-series-measurement';

export default {
  [AtmDataSpecType.Array]: ArrayValueEditorState,
  [AtmDataSpecType.Boolean]: BooleanValueEditorState,
  [AtmDataSpecType.Dataset]: DatasetValueEditorState,
  [AtmDataSpecType.File]: FileValueEditorState,
  [AtmDataSpecType.Number]: NumberValueEditorState,
  [AtmDataSpecType.Object]: ObjectValueEditorState,
  [AtmDataSpecType.Range]: RangeValueEditorState,
  [AtmDataSpecType.String]: StringValueEditorState,
  [AtmDataSpecType.TimeSeriesMeasurement]: TimeSeriesMeasurementValueEditorState,
};
