/**
 * Typedefs for types used across various modules in onedata-gui-common and across all
 * projects using onedata-gui-common.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * User model implemented in each project with specific fields supported by backend.
 * See `models/user.js` in specific projects (onezone-gui, oneprovider-gui).
 * @typedef {DS.Model} UserRecord
 * @property {string} fullName
 * @property {string} username
 */
