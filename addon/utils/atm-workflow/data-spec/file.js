/**
 * Contains type definitions related to "file" automation data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} AtmFileDataSpec
 * @property {'file'} type
 * @property {AtmFileValueConstraints} valueConstraints
 */

/**
 * @typedef {Object} AtmFileValueConstraints
 * @property {AtmFileType} fileType
 */

/**
 * @typedef {string} AtmFileType for possible values see `fileTypes` array below
 */

export const fileTypes = Object.freeze([
  'ANY',
  'REG',
  'DIR',
  'SYMLNK',
]);

export const fileSupertypes = Object.freeze({
  ANY: [],
  REG: ['ANY'],
  DIR: ['ANY'],
  SYMLNK: ['ANY'],
});

export const fileSubtypes = Object.freeze({
  ANY: ['REG', 'DIR', 'SYMLNK'],
  REG: [],
  DIR: [],
  SYMLNK: [],
});

/**
 * @param {Ember.Service} i18n
 * @param {AtmFileType} fileType
 * @returns {SafeString}
 */
export function translateFileType(i18n, fileType) {
  return i18n.t(`utils.atmWorkflow.dataSpec.file.fileTypes.${fileType}`);
}
