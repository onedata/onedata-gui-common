/**
 * A modal that allows create, view and modify workflow lanes. `modalOptions` fields:
 * - `mode` - one of `'create'`, `'edit'`, `'view'`
 * - `definedStores` - collection of available workflow stores
 * - `lane` - will be used to fill form data. Needed when mode is `'edit'` or `'view'`
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import layout from '../../../templates/components/modals/workflow-visualiser/lane-modal';
import { reads } from '@ember/object/computed';
import { computed, trySet } from '@ember/object';

export default Component.extend(I18n, {
  layout,
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.laneModal',

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
   * @type {Boolean}
   */
  isSubmitting: false,

  /**
   * @type {Object}
   */
  laneProvidedByForm: undefined,

  /**
   * @type {Boolean}
   */
  formIsValid: false,

  /**
   * @type {ComputedProperty<String>}
   */
  mode: reads('modalOptions.mode'),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  definedStores: reads('modalOptions.definedStores'),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  createStoreAction: reads('modalOptions.createStoreAction'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  lane: reads('modalOptions.lane'),

  /**
   * @type {ComputedProperty<String>}
   */
  headerText: computed('mode', function headerText() {
    return this.t(`header.${this.get('mode')}`);
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  cancelBtnText: computed('mode', function submitBtnText() {
    return this.t(`button.cancel.${this.get('mode')}`);
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  submitBtnText: computed('mode', function submitBtnText() {
    return this.t(`button.submit.${this.get('mode')}`);
  }),

  actions: {
    formChange({ data, isValid }) {
      this.setProperties({
        laneProvidedByForm: data,
        formIsValid: isValid,
      });
    },
    async submit(submitCallback) {
      this.set('isSubmitting', true);
      try {
        return await submitCallback(this.get('laneProvidedByForm'));
      } catch (error) {
        throw error;
      } finally {
        trySet(this, 'isSubmitting', false);
      }
    },
  },
});
