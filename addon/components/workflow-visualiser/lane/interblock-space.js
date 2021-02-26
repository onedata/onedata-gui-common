import LaneElement from 'onedata-gui-common/components/workflow-visualiser/lane/lane-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane/interblock-space';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { conditional, equal, raw, string, tag } from 'ember-awesome-macros';

export default LaneElement.extend({
  layout,
  classNames: ['workflow-visualiser-interblock-space'],
  classNameBindings: [
    'siblingsTypeClass',
    'positionTypeClass',
  ],
  attributeBindings: [
    'firstBlock.id:data-first-block-id',
    'secondBlock.id:data-second-block-id',
  ],

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.LaneElement>}
   */
  interblockSpace: reads('laneElement'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.LaneElement>}
   */
  parent: reads('interblockSpace.parent'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.LaneElement>}
   */
  firstBlock: reads('interblockSpace.firstBlock'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.LaneElement>}
   */
  secondBlock: reads('interblockSpace.secondBlock'),

  /**
   * @type {ComputedProperty<String>}
   */
  siblingsType: conditional(
    equal('parent.type', raw('lane')),
    raw('parallelBlock'),
    raw('task'),
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  siblingsTypeClass: tag `between-${string.dasherize('siblingsType')}s-space`,

  /**
   * @type {ComputedProperty<String>}
   */
  positionType: computed('firstBlock', 'secondBlock', function positionType() {
    const {
      firstBlock,
      secondBlock,
    } = this.getProperties('firstBlock', 'secondBlock');

    if (firstBlock && secondBlock) {
      return 'between';
    } else if (firstBlock) {
      return 'end';
    } else if (secondBlock) {
      return 'start';
    } else {
      return 'empty';
    }
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  positionTypeClass: tag `space-position-${'positionType'}`,

  /**
   * One of: 'between', 'start', 'end', 'none'
   * @type {ComputedProperty<String>}
   */
  arrowType: computed('siblingsType', 'positionType', 'mode', function arrowType() {
    const {
      siblingsType,
      positionType,
      mode,
    } = this.getProperties('siblingsType', 'positionType', 'mode');

    if (siblingsType !== 'parallelBlock') {
      return 'none';
    }

    if (mode === 'view') {
      return positionType === 'between' ? positionType : 'none';
    } else {
      return positionType !== 'empty' ? positionType : 'none';
    }
  }),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  allowAdding: computed('siblingsType', 'positionType', 'mode', function allowAdding() {
    const {
      siblingsType,
      positionType,
      mode,
    } = this.getProperties('siblingsType', 'positionType', 'mode');

    if (mode === 'view') {
      return false;
    } else if (siblingsType !== 'task') {
      return true;
    } else {
      return positionType !== 'start' && positionType !== 'between';
    }
  }),

  actions: {
    addBlock() {
      this.get('interblockSpace').addBlock();
    },
  },
});
