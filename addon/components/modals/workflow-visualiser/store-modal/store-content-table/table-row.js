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
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  tagName: 'tr',
  classNames: ['table-row', 'data-row'],
  classNameBindings: ['entry.success::error-row'],
  attributeBindings: ['entry.id:data-row-id'],

  errorExtractor: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.storeModal.storeContentTable.tableRow',

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
      errorExtractor,
    } = this.getProperties('columns', 'entry', 'errorExtractor');

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
        type: 'value',
      };
    }).compact();
    if (entryFailed) {
      const errorDescription = errorExtractor.getMessage(error);
      columnsDataEntries.push({
        name: 'error',
        type: 'error',
        value: `${this.t('storeAccessError')}: ${errorDescription.message || this.t('unknownError')}`,
        takesWholeRow: true,
      });
    }
    return columnsDataEntries;
  }),
});
