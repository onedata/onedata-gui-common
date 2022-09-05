import { expect } from 'chai';
import { describe, it } from 'mocha';
import { getFileNameFromPath } from 'onedata-gui-common/utils/file';

describe('Unit | Utility | file', function () {
  describe('getFileNameFromPath', function () {
    testGetFileNameFromPath('/a/b/c', 'c');
    testGetFileNameFromPath('a/b/c', 'c');
    testGetFileNameFromPath('/a', 'a');
    testGetFileNameFromPath('a', 'a');
    testGetFileNameFromPath('a/b/c/', 'c');
    testGetFileNameFromPath(' ', ' ');

    testGetFileNameFromPath('/', null);
    testGetFileNameFromPath('//', null);
    testGetFileNameFromPath('', null);
    testGetFileNameFromPath(undefined, null);
  });
});

function testGetFileNameFromPath(path, result) {
  it(`returns ${JSON.stringify(result)} for path ${JSON.stringify(path) || 'undefined'}`, function () {
    expect(getFileNameFromPath(path)).to.equal(result);
  });
}
