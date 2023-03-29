import Component from '@ember/component';
import { computed, set } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor';
import {
  createModelFromSpec,
  createSectionModelFromSpec,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/create-model';

export default Component.extend({
  layout,
  classNames: ['charts-dashboard-editor'],

  /**
   * @virtual
   * @type {AtmTimeSeriesDashboardSpec}
   */
  dashboardSpec: undefined,

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardSpec.Model>}
   */
  model: computed('dashboardSpec', function model() {
    return createModelFromSpec(this.dashboardSpec);
  }),

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.cacheFor('model')?.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  actions: {
    /**
     * @returns {void}
     */
    createDashboard() {
      if (this.model.rootSection) {
        return;
      }

      set(this.model, 'rootSection', createSectionModelFromSpec({}, true));
    },

    /**
     * @returns {void}
     */
    removeDashboard() {
      const rootSection = this.model.rootSection;
      if (rootSection) {
        rootSection.destroy();
        set(this.model, 'rootSection', null);
      }
    },
  },
});
