/**
 * Lane - aggregates parallel boxes and spaces between them.
 *
 * @module utils/workflow-visualiser/lane
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserRecord from 'onedata-gui-common/utils/workflow-visualiser/visualiser-record';
import { resolve } from 'rsvp';

export default VisualiserRecord.extend({
  /**
   * @override
   */
  __type: 'lane',

  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane',

  /**
   * @virtual optional
   * @type {Object}
   */
  iteratorSpec: undefined,

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
