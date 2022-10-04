/**
 * Contains typedefs and enums and util functions related to files.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

/**
 * @typedef {'REG'|'DIR'|'SYMLNK'} FileType
 * Describes a type of a file - regular, directory or symbolic link.
 */

/**
 * Enum with file types.
 * @type {Object<string, FileType>}
 */
export const FileType = {
  Regular: 'REG',
  Directory: 'DIR',
  SymbolicLink: 'SYMLNK',
};

/**
 * @typedef {'file'|'dir'|'symlink'} LegacyFileType
 * Describes a type of a file - regular, directory or symbolic link. It is
 * a legacy form used in existing code of Oneprovider GUI. Should be avoided
 * in new code (if possible).
 */

/**
 * Enum with file types in existing code of Oneprovider GUI. Should be avoided
 * in new code (if possible).
 * TODO: VFS-9944 Remove all legacy file type usages (including those written
 * without enum).
 * @type {Object<string, LegacyFileType>}
 */
export const LegacyFileType = {
  Regular: 'REG',
  Directory: 'DIR',
  SymbolicLink: 'SYMLNK',
};

/**
 * @typedef {FileType.Regular|FileType.Directory|null} SymbolicLinkTargetType
 * Describes a type of a file pointed by a symbolic link. `null` is for broken
 * symbolic links (unknown target type).
 */

/**
 * Enum with symbolic link target types.
 * @type {Object<string, SymbolicLinkTargetType>}
 */
export const SymbolicLinkTargetType = {
  Regular: FileType.Regular,
  Directory: FileType.Directory,
  Broken: null,
};

/**
 * @type {string}
 */
export const directorySeparator = '/';

/**
 * Returns file name from file path. If file name cannot be extracted, `null`
 * is returned.
 * @param {string} filePath
 * @returns {string|null}
 */
export function getFileNameFromPath(filePath) {
  const pathElements = filePath?.split(directorySeparator) ?? [];
  let lastPathElement = pathElements[pathElements.length - 1];

  // If path ends with a directory separator, then the last element is `''`.
  // In that case we should take the previoius element.
  if (lastPathElement === '') {
    lastPathElement = pathElements[pathElements.length - 2];
  }

  return lastPathElement || null;
}

/**
 * @type {string}
 */
const i18nPrefix = 'utils.file';

/**
 * @param {Ember.Service} i18n
 * @param {FileType|LegacyFileType|null} fileType null means unknown type
 * @param {{ form: 'singular'|'plural', upperFirst: boolean }} [options]
 * @returns {string} strings like "file", "directory" etc.
 */
export function translateFileType(i18n, fileType, {
  form = 'singular',
  upperFirst = false,
} = {}) {
  if (!i18n) {
    console.error('utils/file:translateFileType: i18n is undefined');
    return '';
  }

  const normalizedFileType = fileType ?
    convertFromLegacyFileTypeIfNeeded(fileType) : null;
  const normalizedForm = form === 'plural' ? 'plural' : 'singular';
  const i18nKey = `${i18nPrefix}.fileTypes.${normalizedFileType}.${normalizedForm}`;

  const translation = String(i18n.t(i18nKey)) || '';
  return upperFirst ? _.upperFirst(translation) : translation;
}

/**
 * @param {Ember.Service} i18n
 * @param {FileType|LegacyFileType|null} fileType null means unknown type
 * @param {number} count
 * @returns {string} strings like "2 files" or "1 directory" etc.
 */
export function translateFileCount(i18n, fileType, count) {
  const normalizedCount = Number.isInteger(count) ? count : 0;
  const form = normalizedCount === 1 || normalizedCount === -1 ?
    'singular' : 'plural';
  return `${count} ${translateFileType(i18n, fileType, { form })}`;
}

/**
 * @param {FileType|LegacyFileType} fileType
 * @returns {FileType}
 */
function convertFromLegacyFileTypeIfNeeded(fileType) {
  switch (fileType) {
    case LegacyFileType.Regular:
      return FileType.Regular;
    case LegacyFileType.Directory:
      return FileType.Directory;
    case LegacyFileType.SymbolicLink:
      return FileType.SymbolicLink;
  }
}
