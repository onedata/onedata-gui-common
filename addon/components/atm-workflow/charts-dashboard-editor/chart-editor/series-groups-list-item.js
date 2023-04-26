import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/series-groups-list-item';

export default Component.extend(I18n, {
  layout,
  classNames: ['series-groups-list-item'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.chartEditor.seriesGroupsListItem',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup}
   */
  item: undefined,
});
