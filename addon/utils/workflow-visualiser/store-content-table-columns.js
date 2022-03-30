/**
 * Is responsible for calculating list of columns for store content table.
 *
 * @module utils/workflow-visualiser/store-content-table-columns
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import { camelize } from '@ember/string';

/**
 * @typedef {Object} StoreContentTableColumn
 * @property {String} name
 * @property {String} label
 * @property {String} valuePath
 * @property {String} type one of: `'storeSpecific'`, `'wholeData'`, `'dataBased'`, `'error'`
 */

export default class StoreContentTableColumns {
  constructor(storeType, storeDataSpec, i18n) {
    this.storeType = storeType;
    this.storeDataSpec = storeDataSpec;
    this.i18n = i18n;
    this.storeSpecificColumns = [
      ...this.getStoreTypeSpecificColumns(),
      ...this.getStoreDataSpecSpecificColumns(),
    ];
    this.dataBasedColumns = [];
    this.dataErrorOccurred = false;
    this.dataBasedColumnsLimit = 30;
  }

  t(translationName) {
    return this.i18n.t(
      `components.modals.workflowVisualiser.storeModal.storeContentTable.columns.${translationName}`
    );
  }

  /**
   * @public
   * @returns {Array<StoreContentTableColumn>}
   */
  getColumns() {
    const columns = [...this.storeSpecificColumns];
    const isValueUsedInColumns = columns.some(({ valuePath }) =>
      valuePath[0] === 'value'
    );

    if (this.areColumnsBasedOnData()) {
      if (this.dataBasedColumns.length === 0 && this.dataErrorOccurred) {
        // There must be at least one column to show errors.
        columns.push({
          name: 'error',
          label: String(this.t('error')),
          valuePath: ['value'],
          type: 'error',
        });
      } else {
        columns.push(...this.dataBasedColumns);
      }
    } else if (!isValueUsedInColumns) {
      columns.push({
        name: 'value',
        label: String(this.t('value')),
        valuePath: this.getWholeDataPath(),
        type: 'wholeData',
      });
    }

    return columns;
  }

  /**
   * @public
   * @param {Array<StoreContentTableEntry>} newData
   */
  updateColumnsWithNewData(newData) {
    const freeColumnSlotsNumber = this.getFreeSlotsNumberForDataColumns();
    if (!newData || !this.areColumnsBasedOnData() || freeColumnSlotsNumber === 0) {
      return;
    }

    if (newData.findBy('success', false)) {
      this.dataErrorOccurred = true;
    }

    const existingStringifiedDataPaths = new Set([
      ...this.storeSpecificColumns,
      ...this.dataBasedColumns,
    ].map(col => JSON.stringify(col.valuePath)));
    const columnsFromNewData = this.getDataBasedColumnsFromData(newData);
    const newColumns = columnsFromNewData.filter(column =>
      !existingStringifiedDataPaths.has(JSON.stringify(column.valuePath))
    );

    this.dataBasedColumns.push(...newColumns.slice(0, freeColumnSlotsNumber));
  }

  /**
   * @private
   */
  getStoreTypeSpecificColumns() {
    switch (this.storeType) {
      case 'auditLog': {
        const columns = [{
          name: 'timestamp',
          label: String(this.t('logTime')),
          valuePath: ['value', 'timestamp'],
          type: 'storeSpecific',
          componentName: 'cell-timestamp-ms',
        }, {
          name: 'severity',
          label: String(this.t('severity')),
          valuePath: ['value', 'severity'],
          type: 'storeSpecific',
          componentName: 'cell-severity',
        }];
        if (this.storeDataSpec.type === 'object') {
          columns.push({
            name: 'description',
            label: String(this.t('description')),
            valuePath: ['value', 'content', 'description'],
            type: 'storeSpecific',
          });
        }
        return columns;
      }
      default:
        return [];
    }
  }

  /**
   * @private
   */
  getStoreDataSpecSpecificColumns() {
    switch (this.storeDataSpec.type) {
      case 'range':
        return ['start', 'end', 'step'].map((field) => ({
          name: field,
          label: String(this.t(camelize(`range-${field}`))),
          valuePath: ['value', field],
          type: 'storeSpecific',
        }));
      default:
        return [];
    }
  }

  /**
   * @private
   */
  areColumnsBasedOnData() {
    return ['object', 'file', 'dataset'].includes(this.storeDataSpec.type);
  }

  /**
   * @private
   */
  getFreeSlotsNumberForDataColumns() {
    return this.dataBasedColumnsLimit - this.dataBasedColumns.length;
  }

  /**
   * @private
   * @param {Array<StoreContentTableEntry>} newData
   * @returns {Array<StoreContentTableColumn>}
   */
  getDataBasedColumnsFromData(newData) {
    if (!Array.isArray(newData)) {
      return [];
    }

    const newDataValues = newData.map(item => {
      if (
        !item ||
        item.success === false ||
        !item.value ||
        typeof item.value !== 'object'
      ) {
        return null;
      }
      return item.value;
    }).compact();

    let columns = [];
    switch (this.storeType) {
      case 'auditLog': {
        const newDataEntries = newDataValues.map(value => {
          if (!value.content || typeof value.content !== 'object') {
            return null;
          }
          return value.content;
        }).compact();
        const keysInEachEntry = newDataEntries.map(value => Object.keys(value));
        columns = _.uniq(_.flatten(keysInEachEntry)).map(key => ({
          name: camelize(`value.${key}`),
          label: key,
          valuePath: ['value', 'content', key],
        }));
        break;
      }
      default: {
        const keysInEachValue = newDataValues.map(value => Object.keys(value));
        columns = _.uniq(_.flatten(keysInEachValue)).map(key => ({
          name: camelize(key),
          label: key,
          valuePath: ['value', key],
        }));
        break;
      }
    }

    columns.setEach('type', 'dataBased');
    return columns.sortBy('label');
  }

  /**
   * @returns {Array<String>}
   */
  getWholeDataPath() {
    switch (this.storeType) {
      case 'auditLog':
        return ['value', 'content'];
      default:
        return ['value'];
    }
  }
}
