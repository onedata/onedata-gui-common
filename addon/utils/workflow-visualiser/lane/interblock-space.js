import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';
import { guidFor } from '@ember/object/internals';
import { resolve } from 'rsvp';

export default VisualiserElement.extend({
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
   * @type {Utils.WorkflowVisualiser.VisualiserElement}
   */
  elementBefore: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.VisualiserElement}
   */
  elementAfter: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.VisualiserElement} afterBlock
   * @returns {Promise}
   */
  onAddBlock: undefined,

  init() {
    this._super(...arguments);

    if (this.get('id') === undefined) {
      this.set('id', guidFor(this));
    }
  },

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
