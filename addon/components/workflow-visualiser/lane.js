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
import LaneRunActionsFactory from 'onedata-gui-common/utils/workflow-visualiser/lane/lane-run-actions-factory';
import { computed, getProperties } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { translateLaneStatus } from 'onedata-gui-common/utils/workflow-visualiser/statuses';

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
   * @type {Boolean}
   */
  areRunActionsOpened: false,

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
   * @type {ComputedProperty<String>}
   */
  visibleRunTimingLabel: computed(
    'lane.{runs,visibleRun}',
    function visibleRunTimingLabel() {
      const {
        visibleRun,
        runs,
      } = getProperties(this.get('lane') || {}, 'visibleRun', 'runs');
      const sortedRuns = Object.values(runs || {}).sortBy('runNo');
      const timing = sortedRuns.indexOf(visibleRun) === (sortedRuns.length - 1) ?
        'latest' : 'past';
      return this.t(`runTiming.${timing}`);
    }
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  visibleRunStatusLabel: computed('lane.status', function visibleRunStatusLabel() {
    return translateLaneStatus(this.get('i18n'), this.get('lane.status'));
  }),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.LaneRunActionsFactory>}
   */
  laneRunActionsFactory: computed('actionsFactory', function laneRunActionsFactory() {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');

    return LaneRunActionsFactory.create({
      actionsFactory,
      lane,
    });
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
   * @type {ComputedProperty<Utils.Action>}
   */
  viewFailedItemsAction: computed('actionsFactory', 'lane', function viewFailedItemsAction() {
    const {
      actionsFactory,
      lane,
    } = this.getProperties('actionsFactory', 'lane');
    return actionsFactory.createViewLaneFailedItemsAction({ lane });
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
    'viewFailedItemsAction',
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
        'removeLaneAction',
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
        return [
          viewLaneAction,
        ];
      }
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  laneRunActions: collect('viewFailedItemsAction'),

  actions: {
    changeName(newName) {
      return this.get('lane').modify({ name: newName });
    },
    toggleActionsOpen(state) {
      scheduleOnce('afterRender', this, 'set', 'areActionsOpened', state);
    },
    toggleRunActionsOpen(state) {
      scheduleOnce('afterRender', this, 'set', 'areRunActionsOpened', state);
    },
    changeRun(runNo) {
      this.get('lane').changeRun(runNo);
    },
  },
});
