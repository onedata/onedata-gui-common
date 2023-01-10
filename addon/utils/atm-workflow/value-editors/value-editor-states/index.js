import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import IntegerValueEditorState from './integer';
import ObjectValueEditorState from './object';
import StringValueEditorState from './string';

export default {
  [AtmDataSpecType.Integer]: IntegerValueEditorState,
  [AtmDataSpecType.Object]: ObjectValueEditorState,
  [AtmDataSpecType.String]: StringValueEditorState,
};
