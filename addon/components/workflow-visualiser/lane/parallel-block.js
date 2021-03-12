/**
 * Parallel block - aggregates tasks and spaces between them.
 *
 * @module components/workflow-visualiser/lane/parallel-block
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane/parallel-block';
import { computed } from '@ember/object';
import { reads, collect } from '@ember/object/computed';

export default VisualiserElement.extend({
  layout,
  classNames: ['workflow-visualiser-parallel-block'],

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.ParallelBlock>}
   */
  block: reads('elementModel'),

  /**
   * @type {ComputedProperty<String>}
   */
  name: reads('block.name'),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.VisualiserElement>>}
   */
  blockElements: reads('block.elements'),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  moveUpBlockAction: computed('actionsFactory', 'block', function moveUpBlockAction() {
    const {
      actionsFactory,
      block: parallelBlock,
    } = this.getProperties('actionsFactory', 'block');

    return actionsFactory.createMoveUpParallelBlockAction({ parallelBlock });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  moveDownBlockAction: computed('actionsFactory', 'block', function moveDownBlockAction() {
    const {
      actionsFactory,
      block: parallelBlock,
    } = this.getProperties('actionsFactory', 'block');

    return actionsFactory.createMoveDownParallelBlockAction({ parallelBlock });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  removeBlockAction: computed('actionsFactory', 'block', function removeBlockAction() {
    const {
      actionsFactory,
      block: parallelBlock,
    } = this.getProperties('actionsFactory', 'block');

    return actionsFactory.createRemoveParallelBlockAction({ parallelBlock });
  }),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  blockActions: collect(
    'moveUpBlockAction',
    'moveDownBlockAction',
    'removeBlockAction'
  ),

  actions: {
    changeName(newName) {
      return this.get('block').modify({ name: newName });
    },
  },
});
