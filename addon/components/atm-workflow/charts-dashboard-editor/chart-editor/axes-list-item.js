/**
 * Shows single axis information in a form of list item.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { translateTimeSeriesStandardUnit } from 'onedata-gui-common/utils/time-series';
import { ElementType, chartElementIcons } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/axes-list-item';

export default Component.extend({
  layout,
  classNames: ['axes-list-item'],

  i18n: service(),

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Axis}
   */
  item: undefined,

  /**
   * @type {string}
   */
  icon: chartElementIcons[ElementType.Axis],

  /**
   * @type {string}
   */
  seriesIcon: chartElementIcons[ElementType.Series],

  /**
   * @type {ComputedProperty<string | SafeString>}
   */
  readableUnitName: computed(
    'item.{unitName,unitOptions}',
    function readableUnitName() {
      if (this.item.unitName === 'custom') {
        return this.item.unitOptions?.customName;
      } else {
        return translateTimeSeriesStandardUnit(this.i18n, this.item.unitName);
      }
    }
  ),
});
