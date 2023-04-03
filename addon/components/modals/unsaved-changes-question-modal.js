/**
 * A modal that asks user if unsaved changes should be saved or ignored. Does not
 * need any extra configuration (from `modalOptions`).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import layout from '../../templates/components/modals/unsaved-changes-question-modal';

export default Component.extend(I18n, {
  layout,
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.unsavedChangesQuestionModal',

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  /**
   * @virtual
   * @type {{ saveDisabledReason?: boolean }}
   */
  modalOptions: undefined,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {ComputedProperty<string|undefined>}
   */
  saveDisabledReason: reads('modalOptions.saveDisabledReason'),

  actions: {
    async submit(submitCallback, shouldSaveChanges) {
      const dataToPass = {
        shouldSaveChanges,
      };

      this.set('isSubmitting', true);
      try {
        await submitCallback(dataToPass);
      } finally {
        safeExec(this, () => this.set('isSubmitting', false));
      }
    },
  },
});
