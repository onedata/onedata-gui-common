/**
 * Contains typedefs and enums and util functions related to files.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
