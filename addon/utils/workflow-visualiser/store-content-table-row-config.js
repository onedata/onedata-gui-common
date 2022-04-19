/**
 * Is responsible for calculating config properties of store content rows.
 *
 * @module utils/workflow-visualiser/store-content-table-row-config
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default class StoreContentTableRowConfig {
  constructor(storeType, storeDataSpec) {
    this.storeType = storeType;
    this.storeDataSpec = storeDataSpec;
  }

  /**
   * @public
   * @param {StoreContentTableEntry} entry
   * @returns {String}
   */
  getRowClasses(entry) {
    if (!entry) {
      return '';
    }

    switch (this.storeType) {
      case 'auditLog': {
        const severity = entry.value && entry.value.severity;
        if (severity) {
          return `auditlog-severity-${severity}`;
        }
        return '';
      }
      default:
        return '';
    }
  }
}
