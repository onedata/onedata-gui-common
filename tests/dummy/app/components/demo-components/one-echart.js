/**
 * @author Michał Borzęcki
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
        className: 'chart-tooltip',
        formatter(seriesArr) {
          const timestamp = seriesArr[0].value.timestamp;
          const totalSizeSeries = seriesArr.findBy('seriesId', 'totalSize');
          const filesCountSeries = seriesArr.findBy('seriesId', 'filesCount');
          const storageSeriesArr = seriesArr.filter(
            series => series !== totalSizeSeries && series !== filesCountSeries
          );
          const headerHtml =
            `<div class="tooltip-header">${moment(timestamp).format('DD/MM/YYYY')}</div>`;
          const totalSizeHtml = tooltipSeriesEntry(totalSizeSeries, bytesToString);
          const countHtml = tooltipSeriesEntry(filesCountSeries);
          const mainSeriesHtml = `${countHtml}${totalSizeHtml}`;
          let storagesHtml = '';
          storageSeriesArr.reverse().forEach(storageSeries =>
            storagesHtml += tooltipSeriesEntry(storageSeries, bytesToString)
          );
          const seriesHtml = [mainSeriesHtml, storagesHtml].filter(Boolean).join(
            '<hr class="tooltip-series-separator" />');
          return `${headerHtml}<hr class="tooltip-series-separator" />${seriesHtml}`;
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
        id: `storage${idx}`,
        name: `Storage ${idx}`,
        type: 'line',
        stack: 'storages',
        areaStyle: {},
        smooth: 0.2,
        symbol: 'none',
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
      }],
    };
    const dataset = {
      dimensions: ['timestamp'],
      source: [],
    };
    _.times(valuesCount, (idx) => {
      dataset.source.push({
        timestamp: nowTimestamp - (valuesCount - idx) * 24 * 3600 * 1000,
        totalSize: 0,
        filesCount: Math.floor(Math.random() * 1000),
      });
    });
    for (let storageIdx = 0; storageIdx < storagesCount; storageIdx++) {
      const storageName = `storage${storageIdx}`;
      dataset.dimensions.push(storageName);
      for (const sourceEntry of dataset.source) {
        const storageSize = Math.floor(Math.random() * 10 * MiB);
        sourceEntry[storageName] = storageSize;
        sourceEntry.totalSize += Math.floor(storageSize * (Math.random() / 2 + 0.5));
      }
    }
    dataset.dimensions.push('totalSize', 'filesCount');
    option.dataset = dataset;

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
  if (!series) {
    return '';
  }
  const value = series.value[series.seriesId];
  return `<div class="tooltip-series"><span class="tooltip-label tooltip-series-label">${series.marker} ${series.seriesName}</span> <span class="tooltip-value tooltip-series-value">${valueFormatter(value)}</span></div>`;
}
