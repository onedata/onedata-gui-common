/**
 * @module components/demo-components/one-echart
 * @author Michal Borzecki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import _ from 'lodash';
import moment from 'moment';

const MiB = 1024 * 1024;

export default Component.extend({
  filesCounterChartOption: computed(function filesCounterChartOption() {
    const storagesCount = 3;
    const valuesCount = 14;
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const nowTimestamp = startDate.valueOf();
    const totalSizeSeriesColor = '#FF4A58';
    const countSeriesColor = '#555';
    const option = {
      textStyle: {
        fontFamily: 'Open Sans, sans-serif',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            show: false,
          },
        },
        formatter(seriesArr) {
          const timestamp = seriesArr[0].value[0];
          const totalSizeSeries = seriesArr.find(series => series.seriesId === 'totalSize');
          const countSeries = seriesArr.find(series => series.seriesId === 'filesCount');
          const storageSeriesArr = seriesArr.filter(
            series => series !== totalSizeSeries && series !== countSeries
          );
          const headerHtml =
            `<div class="tooltip-header">${moment(timestamp).format('DD/MM/YYYY')}</div>`;
          const totalSizeHtml = tooltipSeriesEntry(totalSizeSeries, bytesToString);
          const countHtml = tooltipSeriesEntry(countSeries);
          const mainSeriesHtml = `${countHtml}${totalSizeHtml}`;
          let storagesHtml = '';
          storageSeriesArr.reverse().forEach(storageSeries =>
            storagesHtml += tooltipSeriesEntry(storageSeries, bytesToString)
          );
          const seriesHtml = [mainSeriesHtml, storagesHtml].filter(Boolean).join(
            '<hr class="tooltip-series-separator" />');
          return `${headerHtml}${seriesHtml}`;
        },
      },
      legend: {
        type: 'scroll',
        bottom: 10,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          formatter(timestamp) {
            return moment(Number(timestamp)).format('DD/MM[\n]YYYY');
          },
        },
      },
      yAxis: [{
        type: 'value',
        name: 'Total size',
        axisLine: {
          show: true,
        },
        nameTextStyle: axisNameTagStyle(totalSizeSeriesColor),
        axisLabel: {
          formatter(value) {
            return bytesToString(value);
          },
        },
      }, {
        type: 'value',
        name: 'Files count',
        axisLine: {
          show: true,
        },
        nameTextStyle: axisNameTagStyle(countSeriesColor),
        splitLine: {
          show: false,
        },
      }],
      series: [..._.times(storagesCount, (idx) => ({
        name: `Storage ${idx}`,
        type: 'line',
        stack: 'storages',
        areaStyle: {},
        smooth: 0.2,
        symbol: 'none',
        data: [],
      })), {
        id: 'totalSize',
        name: 'Total size',
        type: 'line',
        smooth: true,
        itemStyle: {
          color: totalSizeSeriesColor,
        },
        lineStyle: {
          type: 'dotted',
          width: 3,
        },
        data: [],
      }, {
        id: 'filesCount',
        name: 'Files count',
        type: 'line',
        yAxisIndex: 1,
        itemStyle: {
          color: countSeriesColor,
        },
        lineStyle: {
          type: 'dashed',
          width: 1,
        },
        smooth: true,
        data: [],
      }],
    };

    _.times(valuesCount, (idx) => {
      const timestamp = nowTimestamp - (valuesCount - idx) * 24 * 3600 * 1000;
      let totalSize = 0;
      for (let storageIdx = 0; storageIdx < storagesCount; storageIdx++) {
        const storageSize = Math.floor(Math.random() * 10 * MiB);
        totalSize += storageSize * (Math.random() / 2 + 0.5);
        option.series[storageIdx].data.push([timestamp, storageSize]);
      }
      option.series[storagesCount].data.push([timestamp, totalSize]);
      option.series[storagesCount + 1].data.push([timestamp, Math.floor(Math.random() * 1000)]);
    });
    return option;
  }),

  option: computed(() => ({
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [{
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line',
    }],
  })),

  actions: {
    changeOption() {
      const option = this.get('option');
      this.set('option', Object.assign({}, option, {
        series: [{
          data: option.series[0].data.map(val => Math.max(val * Math.random() * 2, 100)),
          type: 'line',
        }],
      }));
    },
  },
});

function axisNameTagStyle(color) {
  return {
    padding: 4,
    borderRadius: 3,
    fontFamily: 'Open Sans, sans-serif',
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: color,
  };
}

function tooltipSeriesEntry(series, valueFormatter = (val => val)) {
  return series ?
    `<div class="tooltip-series"><span class="tooltip-series-label">${series.marker} ${series.seriesName}</span> <span class="tooltip-series-value">${valueFormatter(series.value[1])}</span></div>` :
    '';
}
