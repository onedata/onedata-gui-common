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
    const columns = this.getStoreTypeSpecificColumns();

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
    } else {
      columns.push({
        name: 'value',
        label: String(this.t('value')),
        valuePath: ['value'],
        type: 'wholeData',
      });
    }

    return columns;
  }

  /**
   * @public
   * @param {Array<StoreContentEntry>} newData
   */
  updateColumnsWithNewData(newData) {
    const freeColumnSlotsNumber = this.getFreeSlotsNumberForDataColumns();
    if (!newData || !this.areColumnsBasedOnData() || freeColumnSlotsNumber === 0) {
      return;
    }

    if (newData.findBy('success', false)) {
      this.dataErrorOccurred = true;
    }

    const existingDataKeys = this.dataBasedColumns.mapBy('valuePath.1');
    const keysInEachNewEntry = (newData || [])
      .filter(({ success, value }) =>
        success !== false && value && typeof value === 'object'
      )
      .map(entry => Object.keys(entry.value));
    const newDataKeys =
      _.difference(_.uniq(_.flatten(keysInEachNewEntry)), existingDataKeys).sort();
    const newDataColumns = newDataKeys.slice(0, freeColumnSlotsNumber).map(key => ({
      name: camelize(key),
      label: key,
      valuePath: ['value', key],
      type: 'dataBased',
    }));
    this.dataBasedColumns.push(...newDataColumns);
  }

  /**
   * @private
   * TODO: VFS-7974 Will be used by Map store
   */
  getStoreTypeSpecificColumns() {
    return [];
  }

  /**
   * @private
   */
  areColumnsBasedOnData() {
    return ['object', 'file', 'dataset']
      // range store has "number" dataSpec, but its value in store browser is an object
      .includes(this.storeDataSpec.type) || this.storeType === 'range';
  }

  /**
   * @private
   */
  getFreeSlotsNumberForDataColumns() {
    return this.dataBasedColumnsLimit - this.dataBasedColumns.length;
  }
}
