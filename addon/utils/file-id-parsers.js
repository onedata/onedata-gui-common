/**
 * Set of parsers dedicated for file ID.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// file entity id holds few values: <guid_type>#<internal_file_id>#<space_id>#<share_id>
const guidRegexp = /guid#(.*)#(.*)/;
const shareGuidRegexp = /shareGuid#(.*)#(.*)#(.*)/;

/**
 * @param {String} fileEntityId
 * @returns {String}
 */
export function getInternalFileIdFromFileId(fileEntityId) {
  const decoded = atob(fileEntityId);
  const m = decoded.match(guidRegexp) || decoded.match(shareGuidRegexp);
  return m && m[1];
}

/**
 * @param {String} fileEntityId
 * @returns {String}
 */
export function getSpaceIdFromFileId(fileEntityId) {
  const decoded = atob(fileEntityId);
  const m = decoded.match(guidRegexp) || decoded.match(shareGuidRegexp);
  return m && m[2];
}

/**
 * @param {String} fileEntityId
 * @returns {String}
 */
export function getShareIdFromFileId(fileEntityId) {
  const decoded = atob(fileEntityId);
  const m = decoded.match(shareGuidRegexp);
  return m && m[3];
}
