/**
 * A modal that allows create, view and modify workflow stores. `modalOptions` fields:
 * - `mode` - one of `'create'`, `'edit'`, `'view'`
 * - `store` - will be used to fill form data. Needed when mode is `'edit'` or `'view'`
 *
 * @module components/modals/workflow-visualiser/store-modal
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import layout from '../../../templates/components/modals/workflow-visualiser/store-modal';
import { reads } from '@ember/object/computed';
import { computed, trySet } from '@ember/object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { next } from '@ember/runloop';

export default Component.extend(I18n, {
  layout,
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.storeModal',

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
   * One of: `'details'`, `'content'`
   * @type {String}
   */
  activeTab: 'details',

  /**
   * @type {Boolean}
   */
  isContentTabRendered: true,

  /**
   * @type {Boolean}
   */
  isSubmitting: false,

  /**
   * @type {Object}
   */
  storeProvidedByForm: undefined,

  /**
   * @type {Boolean}
   */
  formIsValid: false,

  /**
   * @type {ComputedProperty<String>}
   */
  mode: reads('modalOptions.mode'),

  /**
   * @type {ComputedProperty<Object>}
   */
  store: reads('modalOptions.store'),

  /**
   * @type {ComputedProperty<Array<String|undefined>>}
   */
  allowedStoreTypes: reads('modalOptions.allowedStoreTypes'),

  /**
   * @type {ComputedProperty<Array<String|undefined>>}
   */
  allowedDataTypes: reads('modalOptions.allowedDataTypes'),

  /**
   * @type {ComputedProperty<Array<Function|undefined>>}
   */
  getStoreContentCallback: reads('modalOptions.getStoreContentCallback'),

  /**
   * @type {ComputedProperty<String>}
   */
  headerText: computed('mode', function headerText() {
    return this.t(`header.${this.get('mode')}`);
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  cancelBtnText: computed('mode', function cancelBtnText() {
    return this.t(`button.cancel.${this.get('mode')}`);
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  submitBtnText: computed('mode', function submitBtnText() {
    return this.t(`button.submit.${this.get('mode')}`);
  }),

  actions: {
    changeTab(selectedTab) {
      this.set('activeTab', selectedTab);
    },
    reloadContentTab() {
      this.set('isContentTabRendered', false);
      next(() => {
        safeExec(this, 'set', 'isContentTabRendered', true);
      });
    },
    formChange({ data, isValid }) {
      this.setProperties({
        storeProvidedByForm: data,
        formIsValid: isValid,
      });
    },
    async submit(submitCallback) {
      this.set('isSubmitting', true);
      try {
        return await submitCallback(this.get('storeProvidedByForm'));
      } catch (error) {
        throw error;
      } finally {
        trySet(this, 'isSubmitting', false);
      }
    },
  },
});
