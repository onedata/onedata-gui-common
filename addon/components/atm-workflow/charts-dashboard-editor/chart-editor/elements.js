/**
 * Shows "chart elements" section of chart editor. Contains three types of
 * elements (grouped in separate tabs):
 * - seriesx
 * - series groups,
 * - axes.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
   */
  chart: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

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
   * @type {ComputedProperty<Array<{ id: string, name: string, icon: string, componentName: string }>>}
   */
  tabs: computed('tabIds', function tabs() {
    return [{
      id: this.tabIds.series,
      name: 'series',
      icon: 'chart',
      componentName: 'series-list',
    }, {
      id: this.tabIds.seriesGroups,
      name: 'seriesGroups',
      icon: 'items-grid',
      componentName: 'series-groups-list',
    }, {
      id: this.tabIds.axes,
      name: 'axes',
      icon: 'axes',
      componentName: 'axes-list',
    }];
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    if (!this.activeTabId) {
      this.set('activeTabId', this.tabIds.series);
    }
  },
});
