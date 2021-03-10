/**
 * Space between lanes. Allows creating new lanes.
 *
 * @module utils/workflow-visualiser/interlane-space
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserSpace from 'onedata-gui-common/utils/workflow-visualiser/visualiser-space';
import { resolve } from 'rsvp';

export default VisualiserSpace.extend({
  /**
   * @override
   */
  renderer: 'workflow-visualiser/interlane-space',

  /**
   * @override
   */
  type: 'interlaneSpace',

  /**
   * @override
   */
  siblingsType: 'lane',

  /**
   * @virtual
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane|null} afterLane
   * @returns {Promise}
   */
  onAddLane: undefined,

  addLane() {
    const {
      onAddLane,
      elementBefore,
    } = this.getProperties('onAddLane', 'elementBefore');

    if (onAddLane) {
      return onAddLane(elementBefore);
    } else {
      return resolve();
    }
  },
});
