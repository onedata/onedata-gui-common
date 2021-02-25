import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';
import { resolve } from 'rsvp';

export default VisualiserElement.extend({
  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane',

  /**
   * @override
   */
  type: 'lane',

  /**
   * @virtual
   * @type {String}
   */
  name: undefined,

  /**
   * @virtual optional
   * @type {Array<Utils.WorkflowVisualiser.Lane.LaneElement>}
   */
  elements: undefined,

  /**
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @param {Object} modifiedProps
   * @returns {Promise}
   */
  onModify: undefined,

  /**
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @returns {Promise}
   */
  onRemove: undefined,

  init() {
    this._super(...arguments);

    if (!this.get('elements')) {
      this.set('elements', []);
    }
  },

  modify(modifiedProps) {
    const onModify = this.get('onModify');
    return onModify ? onModify(this, modifiedProps) : resolve();
  },

  remove() {
    const onRemove = this.get('onRemove');
    return onRemove ? onRemove(this) : resolve();
  },
});
