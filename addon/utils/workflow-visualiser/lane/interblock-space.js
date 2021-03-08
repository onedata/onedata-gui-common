import VisualiserSpace from 'onedata-gui-common/utils/workflow-visualiser/visualiser-space';
import { resolve } from 'rsvp';

export default VisualiserSpace.extend({
  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane/interblock-space',

  /**
   * @override
   */
  type: 'interblockSpace',

  /**
   * @virtual
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.VisualiserElement} afterElement
   * @returns {Promise}
   */
  onAddLaneElement: undefined,

  addLaneElement() {
    const {
      onAddLaneElement,
      parent,
      elementBefore,
    } = this.getProperties('onAddLaneElement', 'parent', 'elementBefore');

    if (onAddLaneElement) {
      return onAddLaneElement(parent, elementBefore);
    } else {
      return resolve();
    }
  },
});
