// FIXME: jsdoc

// FIXME: common typedef for list page (sprawdzić jak jest w typedefach logów)

/**
 * @typedef {Object} ShareDataListPage
 * @property {Array<ShareListItem>} array
 * @property {boolean} isLast
 */

/**
 * @typedef {Object} ShareIdListPage
 * @property {Array<string>} items
 * @property {boolean} isLast
 */

/**
 * Data about single Share from the dynamic shares list.
 */
export class ShareListItem {
  /** @type {string} */
  index = undefined;

  /** @type {string} */
  shareId = undefined;

  /** @type {string} */
  name = undefined;

  /** @type {FileType} */
  rootFileType = undefined;

  /** @type {string} */
  rootFileId = undefined;

  /** @type {string} */
  privateFileId = undefined;

  /** @type {string} */
  handleId = undefined;

  /** @type {string} */
  sharePublicUrl = undefined;

  /** @type {string} */
  handlePublicUrl = undefined;
}
