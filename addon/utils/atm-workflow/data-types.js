/**
 * @typedef {Object} AtmAvailableValueContainer<T>
 * @property {true} success
 * @property {T} value
 */

/**
 * @typedef {Object} AtmUnavailableValueContainer
 * @property {false} success
 * @property {unknown} error
 */

/**
 * @typedef {AtmAvailableValueContainer<T> | AtmUnavailableValueContainer} AtmValueContainer<T>
 */

/**
 * @typedef {AtmValueContainer<T> & { index: string }} AtmIndexedValueContainer<T>
 */

/**
 * @typedef {number} AtmInteger
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
 * @property {string} [rootFileId]
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

/**
 * @typedef {unknown} AtmOnedatafsCredentials
 */
