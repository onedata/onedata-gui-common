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
