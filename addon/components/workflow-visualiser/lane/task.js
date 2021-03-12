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
import { tag, math, raw, string, gte, notEqual, conditional, equal, and, array } from 'ember-awesome-macros';

const possibleStatuses = ['default', 'success', 'warning', 'error'];

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
   * @type {ComputedProperty<Boolean>}
   */
  showProgress: and(
    equal('mode', raw('view')),
    notEqual('progressPercent', raw(null))
  ),

  /**
   * @type {ComputedProperty<Number|null>}
   */
  progressPercent: computed('task.progressPercent', function progressPercent() {
    const taskProgressPercent = this.get('task.progressPercent');
    if (Number.isFinite(taskProgressPercent)) {
      return Math.min(Math.max(taskProgressPercent, 0), 100);
    } else {
      return null;
    }
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  progressPercentAsText: tag `${math.floor('progressPercent')}%`,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  progressBarStyle: string.htmlSafe(tag `width: ${'progressPercent'}%;`),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasPercentCounterInsideProgressBar: gte('progressPercent', raw(25)),

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
  taskActions: collect('removeTaskAction'),

  actions: {
    changeName(newName) {
      return this.get('task').modify({ name: newName });
    },
  },
});
