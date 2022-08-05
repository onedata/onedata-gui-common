/**
 * @typedef {'REG'|'DIR'|'SYMLNK'} FileType
 */

/**
 * @type {Object<string, FileType>}
 */
export const FileType = {
  Regular: 'REG',
  Directory: 'DIR',
  SymbolicLink: 'SYMLNK',
};

/**
 * @typedef {FileType.Regular|FileType.Directory|null} SymbolicLinkTargetType
 * `null` means broken symbolic link (unknown target type)
 */

/**
 * @type {Object<string, SymbolicLinkTargetType>}
 */
export const SymbolicLinkTargetType = {
  Regular: FileType.Regular,
  Directory: FileType.Directory,
  Broken: null,
};
