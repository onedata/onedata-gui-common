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
import { array, raw } from 'ember-awesome-macros';

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
   * @virtual
   * @type {Object}
   */
  storeIteratorSpec: undefined,

  /**
   * @virtual
   * @type {Array<Utils.WorkflowVisualiser.Store>}
   */
  stores: undefined,

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
  store: array.findBy('stores', raw('id'), 'storeIteratorSpec.storeSchemaId'),

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
