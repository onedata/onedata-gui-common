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
   * @param {Utils.WorkflowVisualiser.VisualiserElement} afterBlock
   * @returns {Promise}
   */
  onAddBlock: undefined,

  addBlock() {
    const {
      onAddBlock,
      parent,
      elementBefore,
    } = this.getProperties('onAddBlock', 'parent', 'elementBefore');

    if (onAddBlock) {
      return onAddBlock(parent, elementBefore);
    } else {
      return resolve();
    }
  },
});
