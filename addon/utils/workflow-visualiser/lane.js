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
import { reads } from '@ember/object/computed';

export default VisualiserRecord.extend({
  /**
   * @override
   */
  __modelType: 'lane',

  /**
   * @override
   */
  renderer: 'workflow-visualiser/lane',

  /**
   * @override
   */
  visibleRunNo: 0,

  /**
   * @virtual
   * @type {Object}
   */
  storeIteratorSpec: undefined,

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

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  iteratedStore: reads('visibleRun.iteratedStore'),

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
