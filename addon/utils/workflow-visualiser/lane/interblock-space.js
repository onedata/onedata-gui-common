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
  firstBlock: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.VisualiserElement}
   */
  secondBlock: undefined,

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
      firstBlock,
    } = this.getProperties('onAddBlock', 'parent', 'firstBlock');

    if (onAddBlock) {
      return onAddBlock(parent, firstBlock);
    } else {
      return resolve();
    }
  },
});
