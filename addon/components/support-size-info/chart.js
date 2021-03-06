/**
 * A component that shows support size information using a chart.
 *
 * @module components/space-support-info/chart
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';

import OnePieChart from 'onedata-gui-common/components/one-pie-chart';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

export default OnePieChart.extend({
  i18n: service(),

  /**
   * @implements
   */
  formatValue(value) {
    return bytesToString(value, { iecFormat: true });
  },

  /**
   * @implements
   */
  generateChartDataSeries() {
    let {
      _sortedData,
      i18n,
    } = this.getProperties('_sortedData', 'i18n');
    let chartDataSeries = this._super(...arguments);
    chartDataSeries.forEach((series, index) => {
      series.tooltipElements = [{
        name: i18n.t('components.supportSizeInfo.chart.supportSize'),
        value: this.formatValue(_sortedData[index].value),
      }, {
        name: i18n.t('components.supportSizeInfo.chart.supportShare'),
        value: Math.round(
          this.getSeriesPercentSize(_sortedData[index]) * 100
        ) + '%',
      }];
    });
    return chartDataSeries;
  },
});
