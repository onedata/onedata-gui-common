import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane';
import { computed } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import Action from 'onedata-gui-common/utils/action';
import computedT from 'onedata-gui-common/utils/computed-t';
import { tag, string } from 'ember-awesome-macros';

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
  lane: reads('visualiserElement'),

  /**
   * @type {ComputedProperty<String>}
   */
  name: reads('lane.name'),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Lane.LaneElement>>}
   */
  laneElements: reads('lane.elements'),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  moveLeftLaneAction: computed('lane', function moveLeftLaneAction() {
    return MoveLeftLaneAction.create({
      ownerSource: this,
      lane: this.get('lane'),
    });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  moveRightLaneAction: computed('lane', function moveRightLaneAction() {
    return MoveRightLaneAction.create({
      ownerSource: this,
      lane: this.get('lane'),
    });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  removeLaneAction: computed('lane', function removeLaneAction() {
    return RemoveLaneAction.create({
      ownerSource: this,
      lane: this.get('lane'),
    });
  }),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  laneActions: collect(
    'moveLeftLaneAction',
    'moveRightLaneAction',
    'removeLaneAction'
  ),

  actions: {
    changeName(newName) {
      return this.get('lane').modify({ name: newName });
    },
  },
});

const LaneActionBase = Action.extend({
  /**
   * @override
   */
  i18nPrefix: tag `components.workflowVisualiser.lane.actions.${'actionName'}Lane`,

  /**
   * @virtual
   * @type {String}
   */
  actionName: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.Lane}
   */
  lane: undefined,

  /**
   * @override
   */
  className: tag `${string.dasherize('actionName')}-lane-action-trigger`,

  /**
   * @override
   */
  title: computedT('title'),
});

const RemoveLaneAction = LaneActionBase.extend({
  /**
   * @override
   */
  actionName: 'remove',

  /**
   * @override
   */
  icon: 'x',

  /**
   * @override
   */
  execute() {
    return this.get('lane').remove();
  },
});

const MoveLeftLaneAction = LaneActionBase.extend({
  /**
   * @override
   */
  actionName: 'moveLeft',

  /**
   * @override
   */
  icon: 'move-left',

  /**
   * @override
   */
  disabled: reads('lane.isFirst'),

  /**
   * @override
   */
  execute() {
    return this.get('lane').move(-1);
  },
});

const MoveRightLaneAction = LaneActionBase.extend({
  /**
   * @override
   */
  actionName: 'moveRight',

  /**
   * @override
   */
  icon: 'move-right',

  /**
   * @override
   */
  disabled: reads('lane.isLast'),

  /**
   * @override
   */
  execute() {
    return this.get('lane').move(1);
  },
});
