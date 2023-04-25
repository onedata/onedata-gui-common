import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/elements';

export default Component.extend(I18n, {
  layout,
  classNames: ['chart-editor-elements'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.chartEditor.elements',

  /**
   * @type {string}
   */
  activeTabId: undefined,

  /**
   * @type {Object<string, string>}
   */
  tabIds: computed(function tabIds() {
    const guid = guidFor(this);
    return {
      series: `${guid}-series`,
      seriesGroups: `${guid}-series-groups`,
      axes: `${guid}-axes`,
    };
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('activeTabId', this.tabIds.series);
  },
});
