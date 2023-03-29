import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/section';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  layout,
  classNames: ['section', 'one-time-series-charts-section'],
  classNameBindings: ['section.isRoot:root-section'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.sectionsEditor.section',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
   */
  section: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.ActionsFactory}
   */
  actionsFactory: undefined,

  actions: {
    /**
     * @returns {void}
     */
    addSubsection() {
      const action = this.actionsFactory.createAddSubsectionAction({
        targetSection: this.section,
      });
      action.execute();
    },
  },
});
