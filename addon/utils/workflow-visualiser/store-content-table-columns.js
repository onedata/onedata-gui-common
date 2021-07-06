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
 * @property {String} [valuePropertyName] if not provided, whole value will be used
 */

export default class StoreContentTableColumns {
  constructor(storeType, storeDataSpec, i18n) {
    this.storeType = storeType;
    this.storeDataSpec = storeDataSpec;
    this.i18n = i18n;
    this.dataBasedColumns = [];
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
      columns.push(...this.dataBasedColumns);
    } else {
      columns.push({
        name: 'value',
        label: String(this.t('value')),
      });
    }

    return columns;
  }

  /**
   * @public
   * @param {Array<any>} newData
   */
  updateColumnsWithNewData(newData) {
    const freeColumnSlotsNumber = this.getFreeSlotsNumberForDataColumns();
    if (!this.areColumnsBasedOnData() || freeColumnSlotsNumber === 0) {
      return;
    }

    const existingDataKeys = this.dataBasedColumns.mapBy('valuePropertyName');
    const keysInEachNewEntry = (newData || [])
      .filter(entry => entry && typeof entry === 'object')
      .map(entry => Object.keys(entry));
    const newDataKeys =
      _.difference(_.uniq(_.flatten(keysInEachNewEntry)), existingDataKeys).sort();
    const newDataColumns = newDataKeys.slice(0, freeColumnSlotsNumber).map(key => ({
      name: camelize(key),
      label: key,
      valuePropertyName: key,
    }));
    this.dataBasedColumns.push(...newDataColumns);
  }

  /**
   * @private
   */
  getStoreTypeSpecificColumns() {
    return [];
  }

  /**
   * @private
   */
  areColumnsBasedOnData() {
    return ['object', 'file', 'dataset']
      .includes(this.storeDataSpec.type) || this.storeType === 'range';
  }

  /**
   * @private
   */
  getFreeSlotsNumberForDataColumns() {
    return 30 - this.dataBasedColumns.length;
  }
}
