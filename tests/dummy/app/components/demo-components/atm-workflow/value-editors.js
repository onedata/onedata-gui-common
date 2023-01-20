import Component from '@ember/component';
import { computed } from '@ember/object';
import {
  AtmDataSpecType,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';
import { FileType } from 'onedata-gui-common/utils/file';

export default Component.extend({
  context: Object.freeze({
    async getFilePathById() {
      return '/space1/dir1/file1.txt';
    },
    async getFileUrlById() {
      return '#';
    },
    async getFileDetailsById(fileId) {
      return {
        file_id: fileId,
        name: 'file1.txt',
        type: FileType.Regular,
        size: 1024,
      };
    },
    async getDatasetUrlById() {
      return '#';
    },
    selectFiles(params) {
      console.log('selecting files with params', params);
    },
  }),

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

  emptyFileEditorStateManager: computed(function emptyFileEditorStateManager() {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.File,
    }, this.context);
  }),

  selectedFileEditorStateManager: computed(function selectedFileEditorStateManager() {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.File,
    }, this.context, {
      file_id: '1234567890',
    });
  }),

  arrayStringEditorStateManager: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Array,
      valueConstraints: {
        itemDataSpec: {
          type: AtmDataSpecType.String,
        },
      },
    });
  }),

  arrayArrayRangeEditorStateManager: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Array,
      valueConstraints: {
        itemDataSpec: {
          type: AtmDataSpecType.Array,
          valueConstraints: {
            itemDataSpec: {
              type: AtmDataSpecType.Range,
            },
          },
        },
      },
    });
  }),

  arrayFileEditorStateManager: computed(function arrayFileEditorStateManager() {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Array,
      valueConstraints: {
        itemDataSpec: {
          type: AtmDataSpecType.File,
        },
      },
    }, this.context);
  }),
});
