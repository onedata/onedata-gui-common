/**
 * Contains typedefs related to automation data types.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {number} AtmInteger
 */

/**
 * @typedef {boolean} AtmBoolean
 */

/**
 * @typedef {string} AtmString
 */

/**
 * @typedef {Object} AtmObject
 */

/**
 * @typedef {Object} AtmFile
 * @property {string} file_id CDMI object ID
 * @property {FileType} [type]
 * @property {string} [name]
 * @property {number|null} [size]
 */

/**
 * @typedef {Object} AtmDataset
 * @property {string} datasetId
 * @property {string} [rootFileId] CDMI object ID
 * @property {string} [rootFilePath]
 * @property {FileType} [rootFileType]
 */

/**
 * @typedef {Object} AtmRange
 * @property {number} start
 * @property {number} end
 * @property {number} step
 */

/**
 * @typedef {Array<T>} AtmArray<T>
 */

/**
 * @typedef {Object} AtmTimeSeriesMeasurement
 * @property {string} tsName
 * @property {number} timestamp
 * @property {number} value
 */
