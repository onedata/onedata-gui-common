import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';
import { resolve } from 'rsvp';

export default VisualiserElement.extend({
  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane/parallel-block',

  /**
   * @override
   */
  type: 'parallelBlock',

  /**
   * @virtual
   * @type {String}
   */
  name: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  isFirst: false,

  /**
   * @virtual
   * @type {Boolean}
   */
  isLast: false,

  /**
   * @virtual optional
   * @type {Array<Utils.WorkflowVisualiser.VisualiserElement>}
   */
  elements: undefined,

  /**
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane.ParallelBlock} parallelBlock
   * @param {Object} modifiedProps
   * @returns {Promise}
   */
  onModify: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane.ParallelBlock} parallelBlock
   * @param {Number} moveStep
   * @returns {Promise}
   */
  onMove: undefined,

  /**
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane.ParallelBlock} parallelBlock
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

  move(moveStep) {
    const onMove = this.get('onMove');
    return onMove ? onMove(this, moveStep) : resolve();
  },

  remove() {
    const onRemove = this.get('onRemove');
    return onRemove ? onRemove(this) : resolve();
  },
});
