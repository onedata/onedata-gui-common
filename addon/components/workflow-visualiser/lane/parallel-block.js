import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane/parallel-block';
import { computed } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import Action from 'onedata-gui-common/utils/action';
import computedT from 'onedata-gui-common/utils/computed-t';
import { tag, string } from 'ember-awesome-macros';

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
  moveUpBlockAction: computed('block', function moveUpBlockAction() {
    return MoveUpBlockAction.create({
      ownerSource: this,
      block: this.get('block'),
    });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  moveDownBlockAction: computed('block', function moveDownBlockAction() {
    return MoveDownBlockAction.create({
      ownerSource: this,
      block: this.get('block'),
    });
  }),

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

const BlockActionBase = Action.extend({
  /**
   * @override
   */
  i18nPrefix: tag `components.workflowVisualiser.parallelBlock.actions.${'actionName'}Block`,

  /**
   * @virtual
   * @type {String}
   */
  actionName: undefined,

  /**
   * @virtual
   * @type {Utils.WorkflowVisualiser.Lane.ParallelBlock}
   */
  block: undefined,

  /**
   * @override
   */
  className: tag `${string.dasherize('actionName')}-parallel-block-action-trigger`,

  /**
   * @override
   */
  title: computedT('title'),
});

const RemoveBlockAction = BlockActionBase.extend({
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
    return this.get('block').remove();
  },
});

const MoveUpBlockAction = BlockActionBase.extend({
  /**
   * @override
   */
  actionName: 'moveUp',

  /**
   * @override
   */
  icon: 'move-up',

  /**
   * @override
   */
  disabled: reads('block.isFirst'),

  /**
   * @override
   */
  execute() {
    return this.get('block').move(-1);
  },
});

const MoveDownBlockAction = BlockActionBase.extend({
  /**
   * @override
   */
  actionName: 'moveDown',

  /**
   * @override
   */
  icon: 'move-down',

  /**
   * @override
   */
  disabled: reads('block.isLast'),

  /**
   * @override
   */
  execute() {
    return this.get('block').move(1);
  },
});
