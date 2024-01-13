/**
 * Base class for visualiser records (concrete data entries like tasks, lanes etc.).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserElement from 'onedata-gui-common/utils/workflow-visualiser/visualiser-element';
import { getBy, conditional, raw } from 'ember-awesome-macros';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { resolve } from 'rsvp';

export default VisualiserElement.extend({
  /**
   * @virtual
   * @type {String}
   */
  name: undefined,

  /**
   * @virtual optional
   * @type {Object}
   */
  runsRegistry: undefined,

  /**
   * Starts from 1
   * @virtual
   * @type {number}
   */
  positionInParent: 1,

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
   * @type {Array<AtmWorkflowSchemaValidationError>}
   */
  validationErrors: undefined,

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

  /**
   * @type {ComputedProperty<AtmLaneRunNumber>}
   */
  visibleRunNumber: conditional(
    getBy('runsRegistry', 'parent.visibleRunNumber'),
    'parent.visibleRunNumber',
    raw(1)
  ),

  /**
   * @type {ComputedProperty<Object>}
   */
  visibleRun: computed('runsRegistry', 'visibleRunNumber', function visibleRun() {
    const {
      runsRegistry,
      visibleRunNumber,
    } = this.getProperties('runsRegistry', 'visibleRunNumber');
    return runsRegistry && runsRegistry[visibleRunNumber];
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  status: reads('visibleRun.status'),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    if (!this.validationErrors) {
      this.set('validationErrors', []);
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
