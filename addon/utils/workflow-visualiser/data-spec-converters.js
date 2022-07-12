/**
 * Provides converters for type <-> data spec. Data specs are used to define type of
 * data accepted by lambda argument/result and stores.
 *
 * @module utils/workflow-visualiser/data-spec-converters
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {{ type, config }} storeProperties
 * @returns {AtmDataSpec|null} null when reading from store is not constrained by
 * data specs mechanism
 */
export function getStoreReadDataSpec({ type, config }) {
  switch (type) {
    case 'auditLog':
      return { type: 'object', valueConstraints: {} };
    case 'list':
    case 'singleValue':
    case 'treeForest':
      return config && config.itemDataSpec || null;
    case 'range':
      return { type: 'range', valueConstraints: {} };
    default:
      return null;
  }
}
