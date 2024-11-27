/**
 * Contains type definitions and classes for shares data models across Onedata.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
  spaceId = undefined;

  /** @type {string} */
  shareId = undefined;

  /** @type {string} */
  name = undefined;

  /** @type {FileType} */
  rootFileType = undefined;

  /** @type {string} */
  rootFilePublicId = undefined;

  /** @type {string} */
  rootFilePrivateId = undefined;

  /** @type {string} */
  handleId = undefined;

  /** @type {string} */
  sharePublicUrl = undefined;

  /** @type {string} */
  handlePublicUrl = undefined;
}
