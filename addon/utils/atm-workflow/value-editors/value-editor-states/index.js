import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import IntegerValueEditorState from './integer';
import ObjectValueEditorState from './object';
import RangeValueEditorState from './range';
import StringValueEditorState from './string';
import TimeSeriesMeasurementValueEditorState from './time-series-measurement';

export default {
  [AtmDataSpecType.Integer]: IntegerValueEditorState,
  [AtmDataSpecType.Object]: ObjectValueEditorState,
  [AtmDataSpecType.Range]: RangeValueEditorState,
  [AtmDataSpecType.String]: StringValueEditorState,
  [AtmDataSpecType.TimeSeriesMeasurement]: TimeSeriesMeasurementValueEditorState,
};
