/**
 * Parallel box - aggregates tasks and spaces between them.
 *
 * @module components/workflow-visualiser/lane/parallel-box
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane/parallel-box';
import { computed } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default VisualiserElement.extend({
  layout,
  classNames: ['workflow-visualiser-parallel-box'],

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.ParallelBox>}
   */
  parallelBox: reads('elementModel'),

  /**
   * @type {ComputedProperty<String>}
   */
  name: reads('parallelBox.name'),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.VisualiserElement>>}
   */
  parallelBoxElements: reads('parallelBox.elements'),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  moveUpParallelBoxAction: computed(
    'actionsFactory',
    'parallelBox',
    function moveUpParallelBoxAction() {
      const {
        actionsFactory,
        parallelBox,
      } = this.getProperties('actionsFactory', 'parallelBox');

      return actionsFactory.createMoveUpParallelBoxAction({ parallelBox });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  moveDownParallelBoxAction: computed(
    'actionsFactory',
    'parallelBox',
    function moveDownParallelBoxAction() {
      const {
        actionsFactory,
        parallelBox,
      } = this.getProperties('actionsFactory', 'parallelBox');

      return actionsFactory.createMoveDownParallelBoxAction({ parallelBox });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  removeParallelBoxAction: computed(
    'actionsFactory',
    'parallelBox',
    function removeParallelBoxAction() {
      const {
        actionsFactory,
        parallelBox,
      } = this.getProperties('actionsFactory', 'parallelBox');

      return actionsFactory.createRemoveParallelBoxAction({ parallelBox });
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  parallelBoxActions: collect(
    'moveUpParallelBoxAction',
    'moveDownParallelBoxAction',
    'removeParallelBoxAction'
  ),

  actions: {
    changeName(newName) {
      return this.get('parallelBox').modify({ name: newName });
    },
    toggleActionsOpen(state) {
      scheduleOnce(
        'afterRender',
        this,
        () => safeExec(this, () => this.set('areActionsOpened', state))
      );
    },
  },
});
