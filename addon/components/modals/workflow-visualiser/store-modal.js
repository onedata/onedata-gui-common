/**
 * A modal that allows create, view and modify workflow stores. `modalOptions` fields:
 * - `mode` - one of `'create'`, `'edit'`, `'view'`,
 * - `viewModeLayout` - one of `'store'`, `'auditLog'`, `'timeSeries'`.
 *   Needed when mode is `'view'`,
 * - `subjectName` - name of a subject described by data in store. Needed when
 *   `viewModeLayout` is `'auditLog'` or `'timeSeries'`,
 * - `store` - will be used to fill form data. Needed when mode is `'edit'` or `'view'`,
 * - `allowedStoreTypes` - is taken into account when `mode` is `'create'`,
 * - `allowedDataTypes` - is taken into account when `mode` is `'create'`,
 * - `getStoreContentCallback` - is needed when `mode` is `'view'`
 * - `getTaskRunForInstanceIdCallback` - is needed (but optional) when `mode` is `'view'`
 *   for audit log stores
 * - `actionsFactory` - the same as above
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
import { raw, or, eq, getBy } from 'ember-awesome-macros';

const possibleContentTabRenderers = {
  default: 'generic',
  timeSeries: 'timeSeries',
  auditLog: 'auditLog',
};

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
   * Initial value is set on init
   * @type {String}
   */
  activeTab: undefined,

  /**
   * @type {Object<string, string>}
   */
  possibleContentTabRenderers,

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
   * @type {ComputedProperty<String>}
   */
  viewModeLayout: or('modalOptions.viewModeLayout', raw('store')),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  subjectName: reads('modalOptions.subjectName'),

  /**
   * @type {ComputedProperty<Object>}
   */
  store: reads('modalOptions.store'),

  /**
   * @type {ComputedProperty<Array<String|undefined>>}
   */
  allowedStoreTypes: reads('modalOptions.allowedStoreTypes'),

  /**
   * @type {ComputedProperty<AtmDataSpec|undefined>}
   */
  allowedStoreReadDataSpec: reads('modalOptions.allowedStoreReadDataSpec'),

  /**
   * @type {ComputedProperty<AtmDataSpec|undefined>}
   */
  allowedStoreWriteDataSpec: reads('modalOptions.allowedStoreWriteDataSpec'),

  /**
   * @type {ComputedProperty<Function>}
   */
  getStoreContentCallback: reads('modalOptions.getStoreContentCallback'),

  /**
   * @type {ComputedProperty<(taskInstanceId: string) => { task: Utils.WorkflowVisualiser.Lane.Task, runNumber: number } | null> | undefined}
   */
  getTaskRunForInstanceIdCallback: reads('modalOptions.getTaskRunForInstanceIdCallback'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.ActionsFactory | undefined>}
   */
  actionsFactory: reads('modalOptions.actionsFactory'),

  /**
   * @type {ComputedProperty<'timeSeries'|'generic'>}
   */
  contentTabRenderer: or(
    getBy('possibleContentTabRenderers', 'store.type'),
    getBy('possibleContentTabRenderers', raw('default'))
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  headerText: computed(
    'mode',
    'viewModeLayout',
    'subjectName',
    function headerText() {
      const {
        mode,
        viewModeLayout,
        subjectName,
      } = this.getProperties('mode', 'viewModeLayout', 'subjectName');

      let translationKey = `header.${mode}`;
      if (mode === 'view') {
        translationKey += `.${viewModeLayout}`;
      }

      return this.t(translationKey, { subjectName });
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  areTabsVisible: eq('mode', raw('view')),

  /**
   * @type {ComputedProperty<String>}
   */
  emptyStoreText: computed('viewModeLayout', function emptyStoreText() {
    return this.t(`emptyStore.${this.get('viewModeLayout')}`);
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

  init() {
    this._super(...arguments);
    this.set('activeTab', this.get('mode') === 'view' ? 'content' : 'details');
  },

  actions: {
    changeTab(selectedTab) {
      this.set('activeTab', selectedTab);
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
