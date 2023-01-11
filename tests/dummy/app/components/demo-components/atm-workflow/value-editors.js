import Component from '@ember/component';
import { computed } from '@ember/object';
import {
  AtmDataSpecType,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';

export default Component.extend({
  integerEditorStateManager: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Integer,
    });
  }),

  objectEditorStateManager: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Object,
    });
  }),

  rangeEditorStateManager: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Range,
    });
  }),

  stringEditorStateManager: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.String,
    });
  }),

  timeSeriesMeasurementEditorStateManager: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.TimeSeriesMeasurement,
    });
  }),
});
