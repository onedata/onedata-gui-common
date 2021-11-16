/**
 * Shows lane details. Needs definedStores and lane passed via context.
 *
 * @module utils/workflow-visualiser/actions/view-lane-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.lane.actions.viewLane',

  /**
   * @override
   */
  className: 'view-lane-action-trigger',

  /**
   * @override
   */
  icon: 'browser-info',

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  definedStores: reads('context.definedStores'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.lane>}
   */
  lane: reads('context.lane'),

  /**
   * @override
   */
  onExecute() {
    const {
      definedStores,
      lane,
      modalManager,
    } = this.getProperties(
      'definedStores',
      'lane',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/lane-modal', {
        mode: 'view',
        definedStores,
        lane,
      }).hiddenPromise
      .then(() => {
        set(result, 'status', 'done');
        return result;
      });
  },
});
