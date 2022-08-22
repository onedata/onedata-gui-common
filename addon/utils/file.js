/**
 * Contains typedefs and enums related to files.
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
