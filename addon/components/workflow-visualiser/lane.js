/**
 * Lane - aggregates parallel boxes and spaces between them.
 *
 * @module components/workflow-visualiser/lane
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VisualiserElement from 'onedata-gui-common/components/workflow-visualiser/visualiser-element';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/lane';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';

export default VisualiserElement.extend({
  layout,
  classNames: ['workflow-visualiser-lane'],

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.lane',

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  lane: reads('elementModel'),

  /**
   * @type {ComputedProperty<String>}
   */
  name: reads('lane.name'),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.VisualiserElement>>}
   */
  laneElements: reads('lane.elements'),

  /**
   * @type {ComputedProperty<String>}
   */
  iteratorStrategyLabel: computed('lane.storeIteratorSpec', function iterateOverLabel() {
    const strategy = this.get('lane.storeIteratorSpec.strategy.type');
    const batchSize = this.get('lane.storeIteratorSpec.strategy.batchSize');
    return strategy ?
      this.t(`iteratorStrategy.${strategy}`, { batchSize }, { defaultValue: '' }) : '';
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  modifyLaneAction: computed('actionsFactory', 'lane', function modifyLaneAction() {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');

    return actionsFactory.createModifyLaneAction({ lane });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  viewLaneAction: computed('actionsFactory', 'lane', function viewLaneAction() {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');

    return actionsFactory.createViewLaneAction({ lane });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  moveLeftLaneAction: computed('actionsFactory', 'lane', function moveLeftLaneAction() {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');

    return actionsFactory.createMoveLeftLaneAction({ lane });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  moveRightLaneAction: computed('actionsFactory', 'lane', function moveRightLaneAction() {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');

    return actionsFactory.createMoveRightLaneAction({ lane });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  clearLaneAction: computed('actionsFactory', 'lane', function clearLaneAction() {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');

    return actionsFactory.createClearLaneAction({ lane });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  removeLaneAction: computed('actionsFactory', 'lane', function removeLaneAction() {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');

    return actionsFactory.createRemoveLaneAction({ lane });
  }),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  laneActions: computed(
    'mode',
    'modifyLaneAction',
    'viewLaneAction',
    'moveLeftLaneAction',
    'moveRightLaneAction',
    'clearLaneAction',
    'removeLaneAction',
    function laneActions() {
      const {
        mode,
        modifyLaneAction,
        viewLaneAction,
        moveLeftLaneAction,
        moveRightLaneAction,
        clearLaneAction,
        removeLaneAction,
      } = this.getProperties(
        'mode',
        'modifyLaneAction',
        'viewLaneAction',
        'moveLeftLaneAction',
        'moveRightLaneAction',
        'clearLaneAction',
        'removeLaneAction'
      );

      if (mode === 'edit') {
        return [
          modifyLaneAction,
          moveLeftLaneAction,
          moveRightLaneAction,
          clearLaneAction,
          removeLaneAction,
        ];
      } else {
        return [viewLaneAction];
      }
    }
  ),

  actions: {
    changeName(newName) {
      return this.get('lane').modify({ name: newName });
    },
    toggleActionsOpen(state) {
      scheduleOnce('afterRender', this, 'set', 'areActionsOpened', state);
    },
    changeRun(runNo) {
      this.get('lane').changeRun(runNo);
    },
  },
});
