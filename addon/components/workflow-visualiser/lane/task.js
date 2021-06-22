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
import { tag, raw, conditional, equal, array, or } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

const possibleStatuses = ['pending', 'active', 'finished', 'failed'];

export default VisualiserElement.extend({
  layout,
  classNames: ['workflow-visualiser-task'],
  classNameBindings: ['statusClass'],

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.task',

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * @type {Boolean}
   */
  areDetailsExpanded: false,

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
  statusTranslation: computed('effectiveStatus', function statusTranslation() {
    return this.t(`details.statuses.${this.get('effectiveStatus')}`, {}, {
      defaultValue: '–',
    });
  }),

  /**
   * @type {ComputedProperty<Number>}
   */
  itemsInProcessing: or('task.itemsInProcessing', raw(0)),

  /**
   * @type {ComputedProperty<Number>}
   */
  itemsProcessed: or('task.itemsProcessed', raw(0)),

  /**
   * @type {ComputedProperty<Number>}
   */
  itemsFailed: or('task.itemsFailed', raw(0)),

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
      scheduleOnce(
        'afterRender',
        this,
        () => safeExec(this, () => this.set('areActionsOpened', state))
      );
    },
    headerClick() {
      if (this.get('mode') !== 'view') {
        return;
      }

      this.toggleProperty('areDetailsExpanded');
    },
  },
});
