import Component from '@ember/component';
import { computed } from '@ember/object';
import {
  AtmDataSpecType,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { ValueEditorStateManager } from 'onedata-gui-common/utils/atm-workflow/value-editors';
import { FileType } from 'onedata-gui-common/utils/file';
import { GroupType } from 'onedata-gui-common/utils/group';

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
        fileId: fileId,
        name: 'file1.txt',
        type: FileType.Regular,
        size: 1024,
      };
    },
    async getDatasetUrlById() {
      return '#';
    },
    async getDatasetDetailsById(datasetId) {
      return {
        datasetId,
        rootFileId: '1234567890',
        rootFilePath: 'abc/def/file1.txt',
        rootFileType: FileType.Regular,
      };
    },
    async getGroupUrlById() {
      return '#';
    },
    async getGroupDetailsById(groupId) {
      return {
        groupId,
        name: 'group1',
        type: GroupType.Organization,
      };
    },
    selectFiles(params) {
      console.log('selecting files with params', params);
    },
    selectDatasets(params) {
      console.log('selecting datasets with params', params);
    },
    selectGroups(params) {
      console.log('selecting groups with params', params);
    },
  }),

  booleanEditorStateManager: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Boolean,
    });
  }),

  numberEditorStateManager1: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Number,
    });
  }),

  numberEditorStateManager2: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Number,
      allowedValues: [1, 1.5, 2, 3],
      integersOnly: true,
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

  stringEditorStateManager1: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.String,
    });
  }),

  stringEditorStateManager2: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.String,
      allowedValues: [
        '',
        'a',
        'b',
        'c',
        'Velit non veniam ut ipsum dolore laboris ea. Reprehenderit velit magna proident qui magna anim elit veniam. Laboris in nulla reprehenderit ex velit aliqua amet cillum do nisi esse cupidatat. Tempor pariatur consectetur proident ipsum magna proident irure ipsum excepteur esse veniam amet.',
      ],
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
      fileId: '1234567890',
    });
  }),

  emptyDatasetEditorStateManager: computed(function emptyDatasetEditorStateManager() {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Dataset,
    }, this.context);
  }),

  selectedDatasetEditorStateManager: computed(
    function selectedDatasetEditorStateManager() {
      return new ValueEditorStateManager({
        type: AtmDataSpecType.Dataset,
      }, this.context, {
        datasetId: '1234567890',
      });
    }
  ),

  emptyGroupEditorStateManager: computed(function emptyGroupEditorStateManager() {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Group,
    }, this.context);
  }),

  selectedGroupEditorStateManager: computed(
    function selectedGroupEditorStateManager() {
      return new ValueEditorStateManager({
        type: AtmDataSpecType.Group,
      }, this.context, {
        groupId: '1234567890',
      });
    }
  ),

  arrayStringEditorStateManager: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Array,
      itemDataSpec: {
        type: AtmDataSpecType.String,
      },
    });
  }),

  arrayArrayRangeEditorStateManager: computed(() => {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Array,
      itemDataSpec: {
        type: AtmDataSpecType.Array,
        itemDataSpec: {
          type: AtmDataSpecType.Range,
        },
      },
    });
  }),

  arrayFileEditorStateManager: computed(function arrayFileEditorStateManager() {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Array,
      itemDataSpec: {
        type: AtmDataSpecType.File,
      },
    }, this.context);
  }),

  arrayDatasetEditorStateManager: computed(function arrayDatasetEditorStateManager() {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Array,
      itemDataSpec: {
        type: AtmDataSpecType.Dataset,
      },
    }, this.context);
  }),

  arrayGroupEditorStateManager: computed(function arrayGroupEditorStateManager() {
    return new ValueEditorStateManager({
      type: AtmDataSpecType.Array,
      itemDataSpec: {
        type: AtmDataSpecType.Group,
      },
    }, this.context);
  }),
});
