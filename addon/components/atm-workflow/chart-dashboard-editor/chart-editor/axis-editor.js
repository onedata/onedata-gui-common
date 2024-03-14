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
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor/chart-editor/axis-editor';
import {
  translateValidationErrorsBatch,
} from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';

export default Component.extend(I18n, {
  classNames: ['axis-editor', 'element-editor'],
  layout,

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartDashboardEditor.chartEditor.axisEditor',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Axis}
   */
  chartElement: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.EditorContext}
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
      labelFormatting: `${guidFor(this)}-label-formatting`,
    };
  }),

  /**
   * @type {ComputedProperty<SafeString | null>}
   */
  labelFormattingValidationErrorsMessage: computed(
    'chartElement.labelFormattingValidationErrors',
    function labelFormattingValidationErrorsMessage() {
      return translateValidationErrorsBatch(
        this.i18n,
        this.chartElement.labelFormattingValidationErrors,
      );
    }
  ),

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
