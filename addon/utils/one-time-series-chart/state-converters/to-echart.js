/**
 * Converts time series chart state to a format compatible with Echart library.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

/**
 * @param {Utils.OneTimeSeriesChart.State} state
 * @returns {ECOption}
 */
export default function toEchart(state) {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          show: false,
        },
      },
      confine: true,
      formatter: getEchartTooltipFormatter(state),
      className: 'chart-tooltip',
    },
    grid: {
      containLabel: true,
      left: 10,
      bottom: 10,
      top: 30,
      right: 30,
    },
    yAxis: state.yAxes.map((yAxis) => ({
      type: 'value',
      name: yAxis.name,
      minInterval: yAxis.minInterval,
      min: ({ min }) => Number.isNaN(min) ? 0 : null,
      max: ({ max }) => Number.isNaN(max) ? 0 : null,
      axisLine: {
        show: true,
      },
      axisLabel: {
        formatter: (value) => yAxis.valueFormatter(value),
      },
    })),
    xAxis: {
      type: 'category',
      data: state.xAxis.timestamps.map(timestamp => String(timestamp)),
      axisLabel: {
        showMaxLabel: true,
        formatter: (value) => state.xAxis.timestampFormatter(value),
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    series: getEchartSeries(state),
  };
}

/**
 * @param {Utils.OneTimeSeriesChart.State} state
 * @returns {(paramsArray: Array<Object>) => string}
 */
function getEchartTooltipFormatter(state) {
  const yAxesMap = _.keyBy(state.yAxes, 'id');
  const seriesMap = _.keyBy(state.series, 'id');

  const seriesGroupIdToSeriesIdsMap = {};
  for (const singleSeries of state.series) {
    const groupId = singleSeries.groupId || null;
    if (seriesGroupIdToSeriesIdsMap[groupId]) {
      seriesGroupIdToSeriesIdsMap[groupId].push(singleSeries.id);
    } else {
      seriesGroupIdToSeriesIdsMap[groupId] = [singleSeries.id];
    }
  }
  const seriesGroupsForTooltip = [{
    id: null,
    stacked: false,
    showSum: false,
  }, ...state.seriesGroups];

  return (paramsArray) => {
    if (!Array.isArray(paramsArray) || paramsArray.length === 0) {
      return null;
    }
    const seriesIdToParamMap = _.keyBy(paramsArray, 'seriesId');
    const timestamp = Number.parseInt(paramsArray[0].value[0]);
    const formattedTimestamp = state.xAxis.timestampFormatter(timestamp);
    const headerHtml =
      `<div class="tooltip-header">${_.escape(formattedTimestamp)}</div>`;

    const seriesGroupsHtml = seriesGroupsForTooltip.map((seriesGroup) => {
      const {
        htmlContent,
      } = formatEchartTooltipSeriesGroup({
        seriesGroup,
        seriesMap,
        yAxesMap,
        seriesGroupIdToSeriesIdsMap,
        seriesIdToParamMap,
      });
      return htmlContent;
    }).filter(Boolean).join('<hr class="tooltip-series-separator" />');

    return `${headerHtml}${seriesGroupsHtml ? '<hr class="tooltip-series-separator" />' : ''}${seriesGroupsHtml}`;
  };
}

const defaultValueFormatter = (val) => val;

/**
 * @param {{
 *   seriesGroup: OTSCSeriesGroup,
 *   seriesMap: Object<string, OTSCSeries>,
 *   yAxesMap: Object<string, OTSCYAxis>,
 *   seriesGroupIdToSeriesIdsMap: Object<string, Array<string>>,
 *   seriesIdToParamMap: Object<string, Object>
 * }} input
 * @returns { htmlContent: string, seriesSum: number, sumValueFormatter: ((val: unknown) => unknown)|undefined}
 */
function formatEchartTooltipSeriesGroup({
  seriesGroup,
  seriesMap,
  yAxesMap,
  seriesGroupIdToSeriesIdsMap,
  seriesIdToParamMap,
}) {
  const usedValueFormatters = new Set();
  let htmlContent = '';
  let seriesSum = 0;

  const directSeriesIds = seriesGroupIdToSeriesIdsMap[seriesGroup.id] || [];
  const directSeriesParamsArray = directSeriesIds
    .map((id) => seriesIdToParamMap[id])
    .filter(Boolean);
  const {
    htmlContent: directSeriesHtml,
    seriesSum: directSeriesSum,
    sumValueFormatter: directSeriesSumValueFormatter,
  } = formatEchartTooltipSeries({
    seriesMap,
    yAxesMap,
    seriesParamsArray: directSeriesParamsArray,
  });

  htmlContent += directSeriesHtml;
  seriesSum += directSeriesSum;
  if (directSeriesSumValueFormatter) {
    usedValueFormatters.add(directSeriesSumValueFormatter);
  }

  for (const subgroup of (seriesGroup.subgroups || [])) {
    const {
      htmlContent: subgroupHtmlContent,
      seriesSum: subgroupSeriesSum,
      sumValueFormatter: subgroupSumValueFormatter,
    } = formatEchartTooltipSeriesGroup({
      seriesGroup: subgroup,
      seriesMap,
      yAxesMap,
      seriesGroupIdToSeriesIdsMap,
      seriesIdToParamMap,
    });

    htmlContent += subgroupHtmlContent;
    seriesSum += subgroupSeriesSum;
    if (subgroupSumValueFormatter) {
      usedValueFormatters.add(subgroupSumValueFormatter);
    }
  }

  let sumValueFormatter = [...usedValueFormatters][0];
  if (htmlContent) {
    let groupHeaderHtml = '';
    if (seriesGroup.name) {
      let sumHtml = '';
      if (seriesGroup.showSum) {
        sumValueFormatter = sumValueFormatter || defaultValueFormatter;
        sumHtml =
          `<span class="tooltip-value tooltip-series-group-sum">${_.escape(sumValueFormatter(seriesSum))}</span>`;
      }
      groupHeaderHtml +=
        `<div class="tooltip-series-group-header"><span class="tooltip-label tooltip-series-group-label">${_.escape(seriesGroup.name)}</span> ${sumHtml}</div>`;
    }
    htmlContent = `<div class="tooltip-series-group">${groupHeaderHtml}${htmlContent}</div>`;
  }

  return {
    htmlContent,
    seriesSum,
    sumValueFormatter,
  };
}

/**
 * @param {{
 *   seriesMap: Object<string, OTSCSeries>,
 *   yAxesMap: Object<string, OTSCYAxis>,
 *   seriesParamsArray: Array<Object>
 * }} input
 * @returns { htmlContent: string, seriesSum: number, sumValueFormatter: ((val: unknown) => unknown)|undefined}
 */
function formatEchartTooltipSeries({
  seriesMap,
  yAxesMap,
  seriesParamsArray,
}) {
  const usedValueFormatters = new Set();
  let htmlContent = '';
  let seriesSum = 0;
  seriesParamsArray.forEach(({ seriesId, seriesName, value: [, yValue], marker }) => {
    const series = seriesMap[seriesId];
    const yAxis = series && yAxesMap[series.yAxisId];
    const valueFormatter = yAxis ? yAxis.valueFormatter : defaultValueFormatter;
    usedValueFormatters.add(valueFormatter);
    htmlContent +=
      `<div class="tooltip-series"><span class="tooltip-label tooltip-series-label">${marker} ${_.escape(seriesName)}</span> <span class="tooltip-value tooltip-series-value">${_.escape(valueFormatter(yValue))}</span></div>`;
    seriesSum += yValue;
  });

  return {
    htmlContent,
    seriesSum,
    sumValueFormatter: [...usedValueFormatters][0],
  };
}

/**
 * @param {Utils.OneTimeSeriesChart.State} state
 * @returns {Array<Object>}
 */
function getEchartSeries(state) {
  const yAxisIdToIdxMap = state.yAxes.reduce((acc, yAxis, idx) => {
    acc[yAxis.id] = idx;
    return acc;
  }, {});

  const seriesGroupsToAddToMap = [...state.seriesGroups];
  const seriesGroupsMap = {};
  while (seriesGroupsToAddToMap.length) {
    const seriesGroup = seriesGroupsToAddToMap.pop();
    seriesGroupsMap[seriesGroup.id] = seriesGroup;
    seriesGroupsToAddToMap.push(...seriesGroup.subgroups);
  }
  const seriesGroupParentsMap = Object.values(seriesGroupsMap)
    .reduce((acc, parentGroup) => {
      parentGroup.subgroups.forEach((subgroup) => {
        acc[subgroup.id] = parentGroup;
      });
      return acc;
    }, {});

  // Generate Echart series representation
  const echartSeries = state.series.map((series) => {
    const seriesGroup = seriesGroupsMap[series.groupId];

    let stackId = null;
    let groupWithPossibleStack = seriesGroup;
    while (!stackId && groupWithPossibleStack) {
      if (groupWithPossibleStack.stacked) {
        stackId = groupWithPossibleStack.id;
      }
      groupWithPossibleStack = seriesGroupParentsMap[groupWithPossibleStack.id];
    }

    return {
      id: series.id,
      name: series.name,
      type: series.type,
      yAxisIndex: yAxisIdToIdxMap[series.yAxisId],
      color: series.color,
      stack: stackId,
      areaStyle: stackId ? {} : null,
      smooth: 0.2,
      data: series.data.map(({ timestamp, value }) => [String(timestamp), value]),
    };
  });

  // Sort Echart series to preserve "natural" order of stacked series (first
  // series in a stack should be at the top).
  const orderedEchartSeries = [];
  const echartSeriesPerStack =
    _.groupBy(echartSeries.filterBy('stack'), 'stack');
  for (const echartSingleSeries of echartSeries) {
    if (!echartSingleSeries.stack) {
      orderedEchartSeries.push(echartSingleSeries);
    } else if (echartSingleSeries.stack in echartSeriesPerStack) {
      orderedEchartSeries.push(
        ...echartSeriesPerStack[echartSingleSeries.stack].reverse()
      );
      delete echartSeriesPerStack[echartSingleSeries.stack];
    }
  }

  return orderedEchartSeries;
}
