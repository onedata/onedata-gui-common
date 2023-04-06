/**
 * A modal that asks user whether selected store should be removed or not.
 * As an additional info it shows a list of records, which uses that store.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/remove-store-modal';

/**
 * @typedef {Object} RemoveStoreModalOptions
 * @property {Utils.WorkflowVisualiser.Store} store
 */

export default Component.extend(I18n, {
  layout,
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.removeStoreModal',

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

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  store: reads('modalOptions.store'),

  /**
   * @type {ComputedProperty<(record: Utils.WorkflowVisualiser.VisualiserRecord) => SafeString>}
   */
  stringifyRecordType: computed(function stringifyRecordType() {
    return (record) =>
      this.t(`recordTypes.${record.__modelType}`, {}, { defaultValue: '' });
  }),

  actions: {
    async submit(submitCallback) {
      this.set('isSubmitting', true);
      try {
        await submitCallback();
      } finally {
        safeExec(this, () => this.set('isSubmitting', false));
      }
    },
  },
});
