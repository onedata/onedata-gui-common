/**
 * Shows audit log store content.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from '../../../../templates/components/modals/workflow-visualiser/store-modal/audit-log-presenter';
import { normalizeEntriesPage } from 'onedata-gui-common/utils/audit-log';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['audit-log-presenter'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.storeModal.auditLogPresenter',

  /**
   * @virtual
   * @type {(browseOptions: AtmStoreContentBrowseOptions) => Promise<AtmStoreContentBrowseResult|null>}
   */
  getStoreContentCallback: undefined,

  /**
   * @type {ComputedProperty<Array<AuditLogBrowserCustomColumnHeader>>}
   */
  customColumnHeaders: computed(function customColumnHeaders() {
    return [{
      classNames: 'description-column-header',
      content: this.t('customColumns.description'),
    }];
  }),

  /**
   * @type {ComputedProperty<(listingParams: AuditLogListingParams) => Promise<AuditLogEntriesPage<unknown>>>}
   */
  fetchLogEntriesCallback: computed(
    'getStoreContentCallback',
    function fetchLogEntriesCallback() {
      const getStoreContentCallback = this.get('getStoreContentCallback');
      return async (listingParams) => {
        const results = await getStoreContentCallback({
          type: 'auditLogStoreContentBrowseOptions',
          ...listingParams,
        });
        return normalizeEntriesPage(results);
      };
    }
  ),
});
