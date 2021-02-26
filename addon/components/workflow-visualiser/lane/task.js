import LaneElement from 'onedata-gui-common/components/workflow-visualiser/lane/lane-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane/task';
import { computed } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import Action from 'onedata-gui-common/utils/action';
import computedT from 'onedata-gui-common/utils/computed-t';
import { tag, math, raw, string, gte } from 'ember-awesome-macros';

export default LaneElement.extend({
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
  task: reads('laneElement'),

  /**
   * @type {ComputedProperty<String>}
   */
  name: reads('task.name'),

  /**
   * @type {ComputedProperty<String>}
   */
  statusClass: tag `status-${'task.status'}`,

  /**
   * @type {ComputedProperty<Boolean>}
   */
  showProgress: computed('progressPercent', function showProgress() {
    return Number.isFinite(this.get('progressPercent'));
  }),

  /**
   * @type {ComputedProperty<Number>}
   */
  progressPercent: math.min(math.max('task.progressPercent', raw(0)), raw(100)),

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
  hasPercentCounterInsideProgressBar: gte('progressPercent', raw(20)),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  removeTaskAction: computed('task', function removeTaskAction() {
    return RemoveTaskAction.create({
      ownerSource: this,
      task: this.get('task'),
    });
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

const RemoveTaskAction = Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.task.actions.removeTask',

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.Lane.Task}
   */
  task: undefined,

  /**
   * @override
   */
  className: 'remove-task-action-trigger',

  /**
   * @override
   */
  icon: 'x',

  /**
   * @override
   */
  title: computedT('title'),

  /**
   * @override
   */
  execute() {
    return this.get('task').remove();
  },
});
