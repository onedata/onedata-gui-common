/**
 * A modal that allows to view and modify charts dashboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { set, computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/charts-dashboard-editor-modal';
import { reads } from '@ember/object/computed';
import { trySet } from '@ember/object';
import _ from 'lodash';

/**
 * @typedef {Object} WorkflowVisualiserChartsDashboardEditorModalOptions
 * @property {'edit'|'view'} mode
 * @property {DashboardModelOwner} dashboardOwner
 */

export default Component.extend(I18n, {
  layout,
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.chartsDashboardEditorModal',

  /**
   * @virtual
   * @type {string}
   */
  modalId: undefined,

  /**
   * @virtual
   * @type {WorkflowVisualiserChartsDashboardEditorModalOptions}
   */
  modalOptions: undefined,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {boolean}
   */
  isModelChanged: false,

  /**
   * @type {ComputedProperty<'edit'|'view'>}
   */
  mode: reads('modalOptions.mode'),

  /**
   * @type {ComputedProperty<DashboardModelOwner>}
   */
  dashboardOwner: reads('modalOptions.dashboardOwner'),

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Model>}
   */
  dashboardModel: reads('dashboardOwner.chartsDashboardEditorModelContainer.dashboardModel'),

  /**
   * @type {ComputedProperty<'store'|'task'|'lane'|'workflow'>}
   */
  dashboardOwnerType: reads('dashboardOwner.__modelType'),

  /**
   * Contains backup of the root section in case of "cancel" button click
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Section | null}
   */
  rootSectionBackup: null,

  /**
   * @private
   * @type {ComputedProperty<() => void>}
   */
  modelChangeListener: computed(function modelChangeListener() {
    return () => {
      const isModelChanged = !_.isEqual(
        this.dashboardModel?.rootSection?.toJson() ?? null,
        this.rootSectionBackup?.toJson() ?? null
      );

      if (this.isModelChanged !== isModelChanged) {
        this.set('isModelChanged', isModelChanged);
      }
    };
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('rootSectionBackup', this.dashboardModel?.rootSection?.clone() ?? null);
    this.dashboardModel?.addChangeListener(this.modelChangeListener);
  },

  /**
   * @override
   */
  willDestroyElement() {
    this._super(...arguments);
    this.dashboardModel?.removeChangeListener(this.modelChangeListener);
  },

  actions: {
    cancel(closeCallback) {
      if (this.dashboardModel) {
        // restore rootSection from backup to undo any changes.
        const currentRootSection = this.dashboardModel.rootSection;
        set(this.dashboardModel, 'rootSection', this.rootSectionBackup);
        currentRootSection?.destroy();
      }
      closeCallback();
    },
    async submit(submitCallback) {
      this.set('isSubmitting', true);
      try {
        return await submitCallback();
      } finally {
        trySet(this, 'isSubmitting', false);
      }
    },
  },
});
