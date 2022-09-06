import { expect } from 'chai';
import { describe, it } from 'mocha';
import { getDatasetNameFromRootFilePath } from 'onedata-gui-common/utils/dataset';

describe('Unit | Utility | dataset', function () {
  describe('getDatasetNameFromRootFilePath', function () {
    testGetDatasetNameFromRootFilePath('/a/b/c', 'c');
    testGetDatasetNameFromRootFilePath('/a', 'a');

    testGetDatasetNameFromRootFilePath('/', null);
    testGetDatasetNameFromRootFilePath('', null);
    testGetDatasetNameFromRootFilePath(undefined, null);
  });
});

function testGetDatasetNameFromRootFilePath(path, result) {
  it(`returns ${JSON.stringify(result)} for path ${JSON.stringify(path) || 'undefined'}`, function () {
    expect(getDatasetNameFromRootFilePath(path)).to.equal(result);
  });
}
