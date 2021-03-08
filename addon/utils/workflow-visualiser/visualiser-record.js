/**
 * Base class for visualiser records (concrete data entries like tasks, lanes etc.).
 *
 * @module utils/workflow-visualiser/visualiser-record
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';
import { resolve } from 'rsvp';

export default VisualiserElement.extend({
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
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} record
   * @param {Object} modifiedProps
   * @returns {Promise}
   */
  onModify: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} record
   * @param {Number} moveStep
   * @returns {Promise}
   */
  onMove: undefined,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.VisualiserRecord} record
   * @returns {Promise}
   */
  onRemove: undefined,

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
