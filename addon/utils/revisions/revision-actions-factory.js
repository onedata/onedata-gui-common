/**
 * Base class for revision actions factories.
 *
 * @module utils/revisions/revision-actions-factory
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default EmberObject.extend({
  /**
   * @param {RevisionNumber} revisionNumber
   * @returns {Array<Utils.Action>}
   */
  createActionsForRevisionNumber( /* revisionNumber */ ) {
    return notImplementedThrow();
  },

  /**
   * @returns {Utils.Action}
   */
  createCreateRevisionAction() {
    return notImplementedThrow();
  },
});
