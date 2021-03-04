import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';
import { guidFor } from '@ember/object/internals';
import { resolve } from 'rsvp';

export default VisualiserElement.extend({
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
   * @type {Utils.WorkflowVisualiser.Lane}
   */
  elementBefore: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.Lane}
   */
  elementAfter: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane} afterLane
   * @returns {Promise}
   */
  onAddLane: undefined,

  init() {
    this._super(...arguments);

    if (this.get('id') === undefined) {
      this.set('id', guidFor(this));
    }
  },

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
