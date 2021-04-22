/**
 * Lane - aggregates parallel blocks and spaces between them.
 *
 * @module components/workflow-visualiser/lane
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane';
import { computed } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';

export default VisualiserElement.extend({
  layout,
  classNames: ['workflow-visualiser-lane'],

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  lane: reads('elementModel'),

  /**
   * @type {ComputedProperty<String>}
   */
  name: reads('lane.name'),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.VisualiserElement>>}
   */
  laneElements: reads('lane.elements'),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  moveLeftLaneAction: computed('actionsFactory', 'lane', function moveLeftLaneAction() {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');

    return actionsFactory.createMoveLeftLaneAction({ lane });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  moveRightLaneAction: computed('actionsFactory', 'lane', function moveRightLaneAction() {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');

    return actionsFactory.createMoveRightLaneAction({ lane });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  clearLaneAction: computed('actionsFactory', 'lane', function clearLaneAction() {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');

    return actionsFactory.createClearLaneAction({ lane });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  removeLaneAction: computed('actionsFactory', 'lane', function removeLaneAction() {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');

    return actionsFactory.createRemoveLaneAction({ lane });
  }),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  laneActions: collect(
    'moveLeftLaneAction',
    'moveRightLaneAction',
    'clearLaneAction',
    'removeLaneAction'
  ),

  actions: {
    changeName(newName) {
      return this.get('lane').modify({ name: newName });
    },
    toggleActionsOpen(state) {
      scheduleOnce('afterRender', this, 'set', 'areActionsOpened', state);
    },
  },
});
