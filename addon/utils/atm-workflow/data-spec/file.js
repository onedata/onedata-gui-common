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
 * @property {'REG'|'DIR'|'SYMLNK'|'ANY'} fileType
 */
