/**
 * Creates new lane. Needs createLaneCallback passed via context. It will then be used
 * to save a new lane.
 *
 * @module utils/workflow-visualiser/actions/create-lane-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.lane.actions.createLane',

  /**
   * @override
   */
  className: 'create-lane-action-trigger',

  /**
   * @override
   */
  icon: 'plus',

  /**
   * @type {ComputedProperty<Function>}
   * @param {Object} newElementProps
   * @returns {Promise}
   */
  createLaneCallback: reads('context.createLaneCallback'),

  /**
   * @override
   */
  onExecute() {
    const newLaneProps = {
      type: 'lane',
      name: String(this.t('newLaneName')),
      tasks: [],
    };

    const result = ActionResult.create();
    return result.interceptPromise(this.get('createLaneCallback')(newLaneProps))
      .then(() => result, () => result);
  },
});
