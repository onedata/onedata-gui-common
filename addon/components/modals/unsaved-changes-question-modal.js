/**
 * A modal that asks user if unsaved changes should be saved or ignored.
 *
 * @module components/modals/unsaved-changes-question-modal
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
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
   * Is described in the file header
   * @virtual
   */
  modalOptions: undefined,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

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
