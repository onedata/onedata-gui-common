import Component from '@ember/component';
import { FileType } from 'onedata-gui-common/utils/file';

export default Component.extend({
  obj1: Object.freeze({
    a: 'b',
    c: ['def'],
  }),

  file1: Object.freeze({
    file_id: 'file1Id',
    name: 'file1.txt',
    size: 1024,
    type: FileType.Regular,
  }),

  dataset1: Object.freeze({
    datasetId: 'dataset id',
    rootFileId: 'file1Id',
    rootFilePath: '/space1/a/b/c/data',
    rootFileType: FileType.Directory,
  }),

  range1: Object.freeze({
    start: 2,
    end: 10,
    step: 1,
  }),

  tsMeasurement1: Object.freeze({
    tsName: 'series1',
    timestamp: 1659533491,
    value: 30,
  }),

  array1: Object.freeze([
    [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
    ],
    [
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
    ],
  ]),

  array1DataSpec: Object.freeze({
    type: 'array',
    itemDataSpec: {
      type: 'array',
      itemDataSpec: {
        type: 'string',
      },
    },
  }),

  context: Object.freeze({
    async getFilePathById() {
      return '/space1/dir1/file1.txt';
    },
    async getFileUrlById() {
      return '#';
    },
    async getDatasetUrlById() {
      return '#';
    },
  }),
});
