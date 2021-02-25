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
  firstLane: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.Lane}
   */
  secondLane: undefined,

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
      firstLane,
    } = this.getProperties('onAddLane', 'firstLane');

    if (onAddLane) {
      return onAddLane(firstLane);
    } else {
      return resolve();
    }
  },
});
