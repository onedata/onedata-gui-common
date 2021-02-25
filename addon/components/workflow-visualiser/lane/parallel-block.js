import LaneElement from 'onedata-gui-common/components/workflow-visualiser/lane/lane-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane/parallel-block';
import { computed } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import Action from 'onedata-gui-common/utils/action';
import computedT from 'onedata-gui-common/utils/computed-t';

export default LaneElement.extend({
  layout,
  classNames: ['workflow-visualiser-parallel-block'],

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.ParallelBlock>}
   */
  block: reads('laneElement'),

  /**
   * @type {ComputedProperty<String>}
   */
  name: reads('block.name'),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Lane.LaneElement>>}
   */
  blockElements: reads('block.elements'),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  removeBlockAction: computed('block', function removeBlockAction() {
    return RemoveBlockAction.create({
      ownerSource: this,
      block: this.get('block'),
    });
  }),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  blockActions: collect('removeBlockAction'),

  actions: {
    changeName(newName) {
      return this.get('block').modify({ name: newName });
    },
  },
});

const RemoveBlockAction = Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.parallelBlock.actions.removeBlock',

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.Lane.ParallelBlock}
   */
  block: undefined,

  /**
   * @override
   */
  className: 'remove-block-action-trigger',

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
    return this.get('block').remove();
  },
});
