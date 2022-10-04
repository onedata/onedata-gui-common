import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import {
  getFileNameFromPath,
  translateFileType,
  translateFileCount,
  FileType,
  LegacyFileType,
} from 'onedata-gui-common/utils/file';
import { lookupService } from '../../helpers/stub-service';

describe('Unit | Utility | file', function () {
  setupTest();

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

  describe('translateFileType', function () {
    let options = {};
    testTranslateFileType(FileType.Regular, options, 'file');
    testTranslateFileType(FileType.Directory, options, 'directory');
    testTranslateFileType(FileType.SymbolicLink, options, 'symbolic link');
    testTranslateFileType(null, options, 'item');
    // Test legacy file types
    testTranslateFileType(LegacyFileType.Regular, options, 'file');
    testTranslateFileType(LegacyFileType.Directory, options, 'directory');
    testTranslateFileType(LegacyFileType.SymbolicLink, options, 'symbolic link');

    options = { form: 'plural' };
    testTranslateFileType(FileType.Regular, options, 'files');
    testTranslateFileType(FileType.Directory, options, 'directories');
    testTranslateFileType(FileType.SymbolicLink, options, 'symbolic links');
    testTranslateFileType(null, options, 'items');

    options = { upperFirst: true };
    testTranslateFileType(FileType.Regular, options, 'File');
    testTranslateFileType(FileType.Directory, options, 'Directory');
    testTranslateFileType(FileType.SymbolicLink, options, 'Symbolic link');
    testTranslateFileType(null, options, 'Item');

    options = { form: 'plural', upperFirst: true };
    testTranslateFileType(FileType.Regular, options, 'Files');
    testTranslateFileType(FileType.Directory, options, 'Directories');
    testTranslateFileType(FileType.SymbolicLink, options, 'Symbolic links');
    testTranslateFileType(null, options, 'Items');
  });

  describe('translateFileCount', function () {
    testTranslateFileCount(FileType.Regular, -2, '-2 files');
    testTranslateFileCount(FileType.Regular, -1, '-1 file');
    testTranslateFileCount(FileType.Regular, 0, '0 files');
    testTranslateFileCount(FileType.Regular, 1, '1 file');
    testTranslateFileCount(FileType.Regular, 2, '2 files');
    testTranslateFileCount(FileType.Regular, 10, '10 files');

    testTranslateFileCount(FileType.Directory, -2, '-2 directories');
    testTranslateFileCount(FileType.Directory, -1, '-1 directory');
    testTranslateFileCount(FileType.Directory, 0, '0 directories');
    testTranslateFileCount(FileType.Directory, 1, '1 directory');
    testTranslateFileCount(FileType.Directory, 2, '2 directories');
    testTranslateFileCount(FileType.Directory, 10, '10 directories');

    testTranslateFileCount(FileType.SymbolicLink, -2, '-2 symbolic links');
    testTranslateFileCount(FileType.SymbolicLink, -1, '-1 symbolic link');
    testTranslateFileCount(FileType.SymbolicLink, 0, '0 symbolic links');
    testTranslateFileCount(FileType.SymbolicLink, 1, '1 symbolic link');
    testTranslateFileCount(FileType.SymbolicLink, 2, '2 symbolic links');
    testTranslateFileCount(FileType.SymbolicLink, 10, '10 symbolic links');

    testTranslateFileCount(null, -2, '-2 items');
    testTranslateFileCount(null, -1, '-1 item');
    testTranslateFileCount(null, 0, '0 items');
    testTranslateFileCount(null, 1, '1 item');
    testTranslateFileCount(null, 2, '2 items');
    testTranslateFileCount(null, 10, '10 items');

    testTranslateFileCount(LegacyFileType.Regular, 0, '0 files');
    testTranslateFileCount(LegacyFileType.Directory, 0, '0 directories');
    testTranslateFileCount(LegacyFileType.SymbolicLink, 0, '0 symbolic links');
  });
});

function testGetFileNameFromPath(path, result) {
  it(`returns ${JSON.stringify(result)} for path ${JSON.stringify(path) || 'undefined'}`, function () {
    expect(getFileNameFromPath(path)).to.equal(result);
  });
}

function testTranslateFileType(type, options, result) {
  it(`returns ${JSON.stringify(result)} for type ${JSON.stringify(type)} and options ${JSON.stringify(options)}`,
    function () {
      const i18n = lookupService(this, 'i18n');
      expect(translateFileType(i18n, type, options)).to.equal(result);
    });
}

function testTranslateFileCount(type, count, result) {
  it(`returns ${JSON.stringify(result)} for type ${JSON.stringify(type)} and count ${count}`,
    function () {
      const i18n = lookupService(this, 'i18n');
      expect(translateFileCount(i18n, type, count)).to.equal(result);
    });
}
