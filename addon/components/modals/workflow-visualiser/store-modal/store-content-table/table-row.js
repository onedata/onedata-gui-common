/**
 * Single store table content row
 *
 * @module components/modals/workflow-visualiser/store-modal/store-content-table/table-row
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../../../templates/components/modals/workflow-visualiser/store-modal/store-content-table/table-row';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  tagName: 'tr',
  classNames: ['table-row', 'data-row'],
  classNameBindings: ['entry.success::error-row'],
  attributeBindings: ['entry.id:data-row-id'],

  /**
   * @virtual
   * @type {Array<StoreContentTableColumn>}
   */
  columns: undefined,

  /**
   * Must have three fields: id (string), index (string) and value (of any type)
   * @virtual
   * @type {StoreContentTableEntry}
   */
  entry: undefined,

  /**
   * @type {ComputedProperty<Array<String>>}
   */
  columnsData: computed('columns', 'entry', function columnsData() {
    const {
      columns,
      entry,
    } = this.getProperties('columns', 'entry');

    if (!columns) {
      return;
    }

    const {
      error,
      success,
    } = (entry || {});
    const entryFailed = success === false;

    const columnsDataEntries = columns.map(({ name, valuePath, type }) => {
      if (entryFailed && type !== 'storeSpecific') {
        return;
      }
      let value = entry || {};
      valuePath.forEach(pathElement =>
        value = value && typeof value === 'object' ? value[pathElement] : undefined
      );
      return {
        name,
        value: value === undefined ? '–' : JSON.stringify(value),
      };
    }).compact();
    if (entryFailed) {
      columnsDataEntries.push({
        name: 'error',
        value: error === undefined ? '–' : JSON.stringify(error),
        takesWholeRow: true,
      });
    }
    return columnsDataEntries;
  }),
});
