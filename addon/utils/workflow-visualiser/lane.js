import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';
import { resolve } from 'rsvp';

export default VisualiserRecord.extend({
  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane',

  /**
   * @override
   */
  type: 'lane',

  /**
   * @virtual optional
   * @type {Array<Utils.WorkflowVisualiser.VisualiserElement>}
   */
  elements: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @returns {Promise}
   */
  onClear: undefined,

  init() {
    this._super(...arguments);

    if (!this.get('elements')) {
      this.set('elements', []);
    }
  },

  clear() {
    const onClear = this.get('onClear');
    return onClear ? onClear(this) : resolve();
  },
});
