/**
 * Provides converters for type <-> data spec. Data specs are used to define type of
 * data accepted by lambda argument/result and stores.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {{ type, config }} storeProperties
 * @returns {AtmDataSpec|null} null when writing to store is not constrained by
 * data specs mechanism
 */
export function getStoreWriteDataSpec({ type, config }) {
  switch (type) {
    case 'auditLog':
      return config && config.logContentDataSpec || null;
    case 'list':
    case 'singleValue':
    case 'treeForest':
    case 'exception':
      return config && config.itemDataSpec || null;
    case 'range':
      return { type: 'range' };
    case 'timeSeries':
      return { type: 'timeSeriesMeasurement' };
    default:
      return null;
  }
}

/**
 * @param {{ type, config }} storeProperties
 * @returns {AtmDataSpec|null} null when reading from store is not constrained by
 * data specs mechanism
 */
export function getStoreReadDataSpec({ type, config }) {
  switch (type) {
    case 'auditLog':
      return { type: 'object' };
    case 'list':
    case 'singleValue':
    case 'treeForest':
    case 'exception':
      return config && config.itemDataSpec || null;
    case 'range':
      return { type: 'range' };
    default:
      return null;
  }
}
