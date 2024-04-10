/**
 * Clear lane. Needs lane instance passed via context.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.lane.actions.clearLane',

  /**
   * @override
   */
  className: 'clear-lane-action-trigger',

  /**
   * @override
   */
  icon: 'checkbox-filled-x',

  /**
   * @override
   */
  disabled: computed('lane.elements.@each.__modelType', function disabled() {
    return !this.lane?.elements?.some(({ __modelType }) => __modelType === 'parallelBox');
  }),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  lane: reads('context.lane'),

  /**
   * @override
   */
  onExecute() {
    const {
      lane,
      modalManager,
    } = this.getProperties(
      'lane',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('question-modal', {
        headerIcon: 'sign-warning-rounded',
        headerText: this.t('modalHeader'),
        descriptionParagraphs: [{
          text: this.t('modalDescription', {
            laneName: get(lane, 'name'),
          }),
        }],
        yesButtonText: this.t('modalYes'),
        yesButtonType: 'danger',
        onSubmit: () =>
          result.interceptPromise(lane.clear()),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },
});
