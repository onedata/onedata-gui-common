/**
 * Downloads audit log store content as JSON file.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import downloadFile from 'onedata-gui-common/utils/download-file';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.store.actions.downloadAuditLog',

  /**
   * @override
   */
  className: 'download-audit-log-action-trigger',

  /**
   * @override
   */
  icon: 'browser-download',

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  atmStore: reads('context.atmStore'),

  /**
   * @type {ComputedProperty<(store: Utils.WorkflowVisualiser.Store) => Promise<string>>}
   */
  onGetAuditLogDownloadUrl: reads('context.onGetAuditLogDownloadUrl'),

  /**
   * @override
   */
  async onExecute() {
    const downloadUrl = await this.onGetAuditLogDownloadUrl(this.atmStore);
    if (downloadUrl) {
      downloadFile({ fileUrl: downloadUrl });
    }
  },
});
