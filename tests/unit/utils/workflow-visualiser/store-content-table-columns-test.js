import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupTest } from 'ember-mocha';
import localeConfig from 'ember-i18n/config/en';
import { getOwner } from '@ember/application';
import StoreContentTableColumns from 'onedata-gui-common/utils/workflow-visualiser/store-content-table-columns';
import _ from 'lodash';

const storeTypes = [
  'list',
  'treeForest',
  'singleValue',
  'range',
];
const dataSpecTypes = [
  'integer',
  'string',
  'object',
  'file',
  'dataset',
];
const dataSpecTypeDataExamples = {
  integer: 1,
  string: 'str',
  object: {},
  file: {},
  dataset: {},
};
const specificColumnsForStoreType = {
  list: [],
  treeForest: [],
  singleValue: [],
  range: [],
};
const initialColumnsForDataSpecType = {
  integer: ['value'],
  string: ['value'],
  object: [],
  file: [],
  dataset: [],
};
const dataSpecTypesForStoreType = {
  list: dataSpecTypes,
  treeForest: ['file', 'dataset'],
  singleValue: dataSpecTypes,
  range: ['integer'],
};
const dataSpecTypesWithObjects = [
  'object',
  'file',
  'dataset',
];

describe('Unit | Utility | workflow visualiser/store content table columns', function () {
  setupTest('util:workflow-visualiser/store-content-table-columns', {
    needs: [
      'service:i18n',
      'locale:en/translations',
      'util:i18n/missing-message',
      'util:i18n/compile-template',
      'config:environment',
    ],
  });

  beforeEach(function () {
    this.i18n = getOwner(this).lookup('service:i18n');
    this.register('locale:en/config', localeConfig);
  });

  storeTypes.forEach(storeType => {
    const storeDataSpecTypes = dataSpecTypesForStoreType[storeType];
    storeDataSpecTypes.forEach(dataSpecType => {
      context(`when store type is "${storeType}" and data spec type is "${dataSpecType}"`,
        function () {
          const emptyTableColumns = [
            ...specificColumnsForStoreType[storeType],
            ...(storeType !== 'range' ? initialColumnsForDataSpecType[dataSpecType] : []),
          ];
          it(`returns ${JSON.stringify(emptyTableColumns)} from "getColumns()"`,
            function () {
              const storeContentTableColumns =
                new StoreContentTableColumns(storeType, { type: dataSpecType }, this.i18n);

              expect(storeContentTableColumns.getColumns().mapBy('name'))
                .to.deep.equal(emptyTableColumns);
            });

          if (dataSpecTypesWithObjects.includes(dataSpecType) || storeType === 'range') {
            it('changes columns list after update with new data', function () {
              const storeContentTableColumns =
                new StoreContentTableColumns(storeType, { type: dataSpecType }, this.i18n);

              storeContentTableColumns
                .updateColumnsWithNewData([{ a: 1 }, { b: 2 }, { a: 3, c: 4 }]);
              expect(storeContentTableColumns.getColumns().mapBy('name'))
                .to.deep.equal([...emptyTableColumns, 'a', 'b', 'c']);

              storeContentTableColumns
                .updateColumnsWithNewData([{ a: 5, d: 6 }, { b: 7 }]);
              expect(storeContentTableColumns.getColumns().mapBy('name'))
                .to.deep.equal([...emptyTableColumns, 'a', 'b', 'c', 'd']);
            });

            it('limits number of data-based columns to 30', function () {
              const storeContentTableColumns =
                new StoreContentTableColumns(storeType, { type: dataSpecType }, this.i18n);

              const data = {};
              _.range(50).forEach(i => data[`a${i}`] = 1);
              storeContentTableColumns.updateColumnsWithNewData([data]);

              const addedKeys = _.range(50).map(i => `a${i}`).sort().slice(0, 30);
              expect(storeContentTableColumns.getColumns().mapBy('name'))
                .to.deep.equal([...emptyTableColumns, ...addedKeys]);
            });
          } else {
            it('does not change columns list after update with new data', function () {
              const exampleData = dataSpecTypeDataExamples[dataSpecType];
              const storeContentTableColumns =
                new StoreContentTableColumns(storeType, { type: dataSpecType }, this.i18n);
              storeContentTableColumns.updateColumnsWithNewData([exampleData]);

              expect(storeContentTableColumns.getColumns().mapBy('name'))
                .to.deep.equal(emptyTableColumns);
            });
          }
        });
    });
  });
});
