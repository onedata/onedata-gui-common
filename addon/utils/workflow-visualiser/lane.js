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
  visibleRunNo: 1,

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
   * @type {RunsListVisibleRunsPosition}
   */
  visibleRunsPosition: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @returns {Promise}
   */
  onClear: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @param {Number} runNo
   * @returns {Any}
   */
  onChangeRun: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Lane} lane
   * @returns {Promise}
   */
  onShowLatestRun: undefined,

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  iteratedStore: reads('visibleRun.iteratedStore'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  exceptionStore: reads('visibleRun.exceptionStore'),

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

  changeRun(runNo) {
    const onChangeRun = this.get('onChangeRun');
    return onChangeRun && onChangeRun(this, runNo);
  },

  showLatestRun() {
    const onShowLatestRun = this.get('onShowLatestRun');
    return onShowLatestRun ? onShowLatestRun(this) : resolve();
  },
});
