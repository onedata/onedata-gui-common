/**
 * Task - single job with progress.
 *
 * @module components/workflow-visualiser/lane/task
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane/task';
import { computed } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { tag, raw, conditional, equal, array } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';

const possibleStatuses = ['pending', 'active', 'finished', 'failed'];

export default VisualiserElement.extend({
  layout,
  classNames: ['workflow-visualiser-task'],
  classNameBindings: ['statusClass'],

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.Task>}
   */
  task: reads('elementModel'),

  /**
   * @type {ComputedProperty<String>}
   */
  name: reads('task.name'),

  /**
   * @type {ComputedProperty<String>}
   */
  effectiveStatus: conditional(
    array.includes(raw(possibleStatuses), 'task.status'),
    'task.status',
    raw(possibleStatuses[0])
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  statusClass: conditional(
    equal('mode', raw('view')),
    tag `status-${'effectiveStatus'}`,
    raw('')
  ),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  modifyTaskAction: computed('actionsFactory', 'task', function modifyTaskAction() {
    const {
      actionsFactory,
      task,
    } = this.getProperties('actionsFactory', 'task');

    return actionsFactory.createModifyTaskAction({ task });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  removeTaskAction: computed('actionsFactory', 'task', function removeTaskAction() {
    const {
      actionsFactory,
      task,
    } = this.getProperties('actionsFactory', 'task');

    return actionsFactory.createRemoveTaskAction({ task });
  }),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  taskActions: collect('modifyTaskAction', 'removeTaskAction'),

  actions: {
    changeName(newName) {
      return this.get('task').modify({ name: newName });
    },
    toggleActionsOpen(state) {
      scheduleOnce('afterRender', this, 'set', 'areActionsOpened', state);
    },
  },
});
