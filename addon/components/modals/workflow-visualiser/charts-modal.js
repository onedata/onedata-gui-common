/**
 * A modal that allows to view and modify charts dashboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/charts-modal';
import { reads } from '@ember/object/computed';
import { trySet } from '@ember/object';

/**
 * @typedef {Object} WorkflowVisualiserChartsModalOptions
 * @property {'edit'|'view'} mode
 * @property {'lane'|'workflow'} dashboardOwnerType
 */

export default Component.extend(I18n, {
  layout,
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.chartsModal',

  /**
   * @virtual
   * @type {string}
   */
  modalId: undefined,

  /**
   * @virtual
   * @type {WorkflowVisualiserChartsModalOptions}
   */
  modalOptions: undefined,

  /**
   * Initial value is set on init
   * @type {'visualisation'|'definition'}
   */
  activeTab: undefined,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {ComputedProperty<'edit'|'view'>}
   */
  mode: reads('modalOptions.mode'),

  /**
   * @type {ComputedProperty<'lane'|'workflow'>}
   */
  dashboardOwnerType: reads('modalOptions.dashboardOwnerType'),

  init() {
    this._super(...arguments);
    this.set('activeTab', this.mode === 'view' ? 'visualisation' : 'definition');
  },

  actions: {
    async submit(submitCallback) {
      this.set('isSubmitting', true);
      try {
        // FIXME return await submitCallback(sth);
      } finally {
        trySet(this, 'isSubmitting', false);
      }
    },
  },
});
