import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import IntegerValueEditorState from './integer';
import StringValueEditorState from './string';

export default {
  [AtmDataSpecType.Integer]: IntegerValueEditorState,
  [AtmDataSpecType.String]: StringValueEditorState,
};
