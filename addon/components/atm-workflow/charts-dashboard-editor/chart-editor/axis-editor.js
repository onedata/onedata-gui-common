/**
 * Editor dedicated to modify chart axis element.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/axis-editor';

export default Component.extend(I18n, {
  classNames: ['axis-editor', 'element-editor'],
  layout,

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.chartEditor.axisEditor',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Axis}
   */
  chartElement: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.EditorContext}
   */
  editorContext: undefined,

  /**
   * @type {string}
   */
  activeTabId: undefined,

  /**
   * @type {ComputedProperties<Object<string, string>>}
   */
  tabIds: computed(function tabIds() {
    return {
      attachedSeries: `${guidFor(this)}-attached-series`,
      labelsFormatting: `${guidFor(this)}-labels-formatting`,
    };
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('activeTabId', this.tabIds.attachedSeries);
  },

  actions: {
    changeTab(tabIdToSelect) {
      this.set('activeTabId', tabIdToSelect);
    },
  },
});
