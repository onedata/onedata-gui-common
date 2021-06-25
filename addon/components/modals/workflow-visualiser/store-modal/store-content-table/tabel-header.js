/**
 * Renders proper store content table header depending on store type.
 *
 * @module components/modals/workflow-visualiser/store-modal/store-content-table/table-header
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../../../templates/components/modals/workflow-visualiser/store-modal/store-content-table/tabel-header';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { tag } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  layout,
  tagName: 'thead',
  classNames: ['table-header'],
  classNameBindings: ['storeTypeClass'],

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
   * @type {ComputedProperty<String>}
   */
  storeTypeClass: tag `${'storeType'}-table-header`,

  /**
   * @type {ComputedProperty<Array<String>>}
   */
  columns: computed('storeType', function columns() {
    // Will be more complicated when new type of stores will occur, like map or
    // auditLog.
    return ['value'];
  }),
});
