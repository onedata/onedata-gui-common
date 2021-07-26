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
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { eq, raw, string, tag } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  layout,
  tagName: '',

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
   * @virtual
   * @type {Utils.WorkflowVisualiser.StoreContentTableRowConfig}
   */
  config: undefined,

  /**
   * Must have three fields: id (string), index (string) and value (of any type)
   * @virtual
   * @type {StoreContentTableEntry}
   */
  entry: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  isExpanded: false,

  /**
   * Width of the area visible in scrollable table (visible viewport). May be smaller
   * than the width of a row.
   * @virtual
   * @type {Number}
   */
  visibleAreaWidth: undefined,

  /**
   * Number of pixels by which visible area is scrolled in the X axis.
   * @virtual
   * @type {Number}
   */
  visibleAreaXOffset: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onExpand: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onCollapse: notImplementedIgnore,

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isEntryFailed: eq('entry.success', raw(false)),

  /**
   * @type {ComputedProperty<String>}
   */
  classes: computed('entry', 'config', function classes() {
    const {
      entry,
      config,
    } = this.getProperties('entry', 'config');
    if (!entry || !config) {
      return '';
    }
    return config.getRowClasses(entry);
  }),

  /**
   * Array of objects:
   * ```
   * {
   *   name: String,
   *   type: 'error' | 'value',
   *   value: String,
   *   takesWholeRow: Boolean,
   * }
   * ```
   * @type {ComputedProperty<Array<Object>>}
   */
  columnsData: computed('columns', 'entry', 'isEntryFailed', function columnsData() {
    const {
      columns,
      entry,
      isEntryFailed,
      errorExtractor,
    } = this.getProperties('columns', 'entry', 'isEntryFailed', 'errorExtractor');

    if (!columns) {
      return;
    }

    const normalizedEntry = entry || {};
    const columnsDataEntries = columns.map(({ name, valuePath, type, componentName }) => {
      if (isEntryFailed && type !== 'storeSpecific') {
        return;
      }
      let value = normalizedEntry;
      valuePath.forEach(pathElement =>
        value = value && typeof value === 'object' ? value[pathElement] : undefined
      );
      return {
        name,
        value: componentName ?
          value : (value === undefined ? '–' : JSON.stringify(value)),
        type: 'value',
        componentName,
      };
    }).compact();
    if (isEntryFailed) {
      const error = normalizedEntry.error;
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

  /**
   * @type {ComputedProperty<String>}
   */
  detailsData: computed('entry', 'isEntryFailed', function detailsData() {
    const {
      entry,
      isEntryFailed,
    } = this.getProperties('entry', 'isEntryFailed');
    const data = (entry || {})[isEntryFailed ? 'error' : 'value'];
    return JSON.stringify(data, null, 2);
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  detailsContainerStyle: string.htmlSafe(
    // Width has -1px, to prevent from overflowing on the right side due to translateX
    // (non - pixel - perfect rendering issues).
    tag `width: calc(${'visibleAreaWidth'}px - 1px); transform: translateX(${'visibleAreaXOffset'}px);`
  ),
});
