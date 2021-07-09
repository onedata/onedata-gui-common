/**
 * Renders proper store content table header depending on store type.
 *
 * @module components/modals/workflow-visualiser/store-modal/store-content-table/table-header
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../../../templates/components/modals/workflow-visualiser/store-modal/store-content-table/table-header';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  tagName: 'tr',
  classNames: ['table-header-row'],
  classNameBindings: ['visible::labels-hidden'],

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.storeModal.storeContentTable.tableHeader',

  /**
   * @virtual
   * @type {String}
   */
  storeType: undefined,

  /**
   * @virtual
   * @type {Array<StoreContentTableColumn>}
   */
  columns: undefined,

  /**
   * @override
   */
  visible: computed('tableColumns', function isVisible() {
    const columns = this.get('columns');
    return columns && (
      columns.length > 1 ||
      (columns.length === 1 && columns[0].type === 'dataBased')
    );
  }),
});
