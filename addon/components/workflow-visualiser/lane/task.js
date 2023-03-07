/**
 * Task - single job with progress.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane/task';
import { get, computed } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { tag, raw, conditional, equal, or } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';
import {
  normalizeTaskStatus,
  translateTaskStatus,
} from 'onedata-gui-common/utils/workflow-visualiser/statuses';
import { inject as service } from '@ember/service';

export default VisualiserElement.extend({
  layout,
  classNames: ['workflow-visualiser-task'],
  classNameBindings: ['statusClass'],

  clipboardActions: service(),

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
    const {
      i18n,
      effectiveStatus,
    } = this.getProperties('i18n', 'effectiveStatus');
    return translateTaskStatus(i18n, effectiveStatus);
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
  effectiveStatus: computed('task.status', function effectiveStatus() {
    return normalizeTaskStatus(this.get('task.status'));
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  statusClass: conditional(
    equal('mode', raw('view')),
    tag `status-${'effectiveStatus'}`,
    raw('')
  ),

  /**
   * @type {ComputedProperty<Util.Action>}
   */
  copyInstanceIdAction: computed('task.instanceId', function copyIdAction() {
    const {
      clipboardActions,
      task,
    } = this.getProperties('clipboardActions', 'task');
    return clipboardActions.createCopyRecordIdAction({
      record: { entityId: get(task, 'instanceId') },
    });
  }),

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
   * @type {ComputedProperty<Utils.Action>}
   */
  viewTaskAuditLogAction: computed(
    'actionsFactory',
    'task',
    function viewTaskAuditLogAction() {
      const {
        actionsFactory,
        task,
      } = this.getProperties('actionsFactory', 'task');

      return actionsFactory.createViewTaskAuditLogAction({ task });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  viewTaskTimeSeriesAction: computed(
    'actionsFactory',
    'task',
    function viewTaskTimeSeriesAction() {
      const {
        actionsFactory,
        task,
      } = this.getProperties('actionsFactory', 'task');

      return actionsFactory.createViewTaskTimeSeriesAction({ task });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  viewTaskPodsActivityAction: computed(
    'actionsFactory',
    'task',
    function viewTaskPodsActivityAction() {
      const {
        actionsFactory,
        task,
      } = this.getProperties('actionsFactory', 'task');

      return actionsFactory.createViewTaskPodsActivityAction({ task });
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  editTaskActions: collect('modifyTaskAction', 'removeTaskAction'),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  viewTaskActions: computed(
    'viewTaskAuditLogAction.disabled',
    'viewTaskTimeSeriesAction.disabled',
    'viewTaskPodsActivityAction.disabled',
    function viewTaskActions() {
      return [
        'viewTaskAuditLogAction',
        'viewTaskTimeSeriesAction',
        'viewTaskPodsActivityAction',
      ].map((actionPropName) => this.get(actionPropName)).rejectBy('disabled');
    }
  ),

  actions: {
    changeName(newName) {
      return this.get('task').modify({ name: newName });
    },
    toggleActionsOpen(state) {
      scheduleOnce('afterRender', this, 'set', 'areActionsOpened', state);
    },
    headerClick() {
      if (this.get('mode') !== 'view') {
        return;
      }

      this.toggleProperty('areDetailsExpanded');
    },
  },
});
