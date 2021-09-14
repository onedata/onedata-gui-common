/**
 * Provides clipboard manipulation functions ready to use for GUI.
 *
 * @module services/clipboard-actions
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import CopyRecordIdAction from 'onedata-gui-common/utils/clipboard-actions/copy-record-id-action';

export default Service.extend({
  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     record: GraphSingleModel,
   *   }
   *   ```
   * @returns {Utils.ClipboardActions.CopyRecordIdAction}
   */
  createCopyRecordIdAction(context) {
    return CopyRecordIdAction.create({ ownerSource: this, context });
  },
});
