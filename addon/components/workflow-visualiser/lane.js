import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane';
import { computed } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import Action from 'onedata-gui-common/utils/action';
import computedT from 'onedata-gui-common/utils/computed-t';

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
  removeLaneAction: computed('lane', function removeLaneAction() {
    return RemoveLaneAction.create({
      ownerSource: this,
      lane: this.get('lane'),
    });
  }),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  laneActions: collect('removeLaneAction'),

  actions: {
    changeName(newName) {
      return this.get('lane').modify({ name: newName });
    },
  },
});

const RemoveLaneAction = Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.lane.actions.removeLane',

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.Lane}
   */
  lane: undefined,

  /**
   * @override
   */
  className: 'remove-lane-action-trigger',

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
    return this.get('lane').remove();
  },
});
