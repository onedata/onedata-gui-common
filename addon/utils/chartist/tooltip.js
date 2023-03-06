/**
 * Plugin for Chartist which adds tooltip. For bar and line charts tooltip
 * creates description based on chartist legend and values. For pie chart data for tooltip is
 * taken from data.series.tooltipElements. For example:
 * ```
 * tooltipElements: [{
 *     name: 'prop1',
 *     value: '100',
 *   },
 *   {
 *     name: 'desc2',
 *     value: '23%',
 * }]
 * ```
 *
 * Options:
 * - chartType - type of the chart (bar, line, pie)
 * - rangeInTitle - takes two x axis labels instead of one to tooltip title
 * - renderAboveBarDescription - [bar chart only] if true, places tooltip
 * above a text instead of bar
 * - topOffset - top offset of a tooltip
 * - valueSuffix - [bar/line chart only] suffix for tooltip entries (e.g. for units)
 * - roundValues - if true, values in tooltip will be rounded
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* global Chartist */
import _ from 'lodash';
import $ from 'jquery';
import dynamicRound from 'onedata-gui-common/utils/dynamic-round';
import dom from 'onedata-gui-common/utils/dom';

const TOOLTIP_HTML = `
  <div class="chart-tooltip">
    <div class="chart-tooltip-title"></div>
    <ul class="ct-legend">
    </ul>
    <div class="chart-tooltip-arrow"></div>
  </div>
`;

let chartsIndex = [];

export default function tooltip(options) {
  const defaultOptions = {
    chartType: 'bar',
    rangeInTitle: false,
    renderAboveBarDescription: false,
    topOffset: -10,
    valueSuffix: '',
    roundValues: true,
  };
  const normalizedOptions = Chartist.extend({}, defaultOptions, options);

  return (chart) => {
    let tooltipNode;
    const container = $(chart.container);

    const chartEntry = getChartRenderEntry(chart);

    const prepareTooltip = function (tooltipData, data) {
      // title
      const title = $(tooltipNode.querySelector('.chart-tooltip-title'));
      title.empty();
      title.append(chart.data.labels[data.index]);
      if (options.rangeInTitle) {
        if (chart.data.labels[data.index + 1]) {
          title.append(' - ' + chart.data.labels[data.index + 1]);
        } else if (chart.data.lastLabel) {
          title.append(' - ' + chart.data.lastLabel);
        }
      }

      // data series and values
      const ul = $(tooltipNode.querySelector('.ct-legend'));
      ul.empty();
      const suffix = normalizedOptions.valueSuffix ? ' ' + normalizedOptions.valueSuffix : '';
      tooltipData.forEach(d => {
        let value = d.value;
        if (normalizedOptions.roundValues && typeof value === 'number') {
          value = dynamicRound(value);
        }
        ul.append(`<li class="${d.className}">${d.name}: ${value + suffix}</li>`);
      });
    };

    chart.on('created', () => {
      if (!isPluginEnabled(chart)) {
        chartEntry.x = chartEntry.y = null;
        return;
      }
      tooltipNode = container.find('.chart-tooltip')[0];
      if (!tooltipNode) {
        tooltipNode = $.parseHTML(TOOLTIP_HTML.trim())[0];
        container.append(tooltipNode);
        dom.setStyles(tooltipNode, {
          transform: 'translateY(-100%) translateX(-50%)',
          marginTop: `${options.topOffset}px`,
        });
      } else {
        if (chartEntry.x !== null) {
          const element = document.elementFromPoint(chartEntry.x, chartEntry.y);
          const elementIndex = chartEntry.showCallbacksTargets.indexOf(element);
          if (elementIndex > -1) {
            chartEntry.showCallbacks[elementIndex](chartEntry.x, chartEntry.y);
          } else {
            chartEntry.x = chartEntry.y = null;
            tooltipNode.classList.remove('active');
          }
        } else {
          tooltipNode.classList.remove('active');
        }
      }
      $(chart.svg.getNode()).mousemove((event) => {
        if (!event.target.closest('.ct-series')) {
          tooltipNode.classList.remove('active');
          chartEntry.x = chartEntry.y = null;
        }
      });
    });

    chart.on('draw', function (data) {
      if (!isPluginEnabled(chart)) {
        return;
      }
      let tooltipData = chart.data.series.map(s => ({
        className: s.className,
        name: s.name,
        value: s.data[data.index],
      }));

      if (data.type === 'bar' && normalizedOptions.chartType === 'bar') {
        const groupNode = data.group._node;
        const barNode = $(data.element._node);

        barNode.mouseover(() => {
          const lastGroupNode = groupNode.parentElement.lastElementChild;
          const lastGroupBar =
            lastGroupNode.querySelectorAll(':scope > line')[data.index];
          const containerOffset = dom.offset(container[0]);

          // top position
          if (normalizedOptions.renderAboveBarDescription) {
            const sumLabel = lastGroupNode.querySelectorAll(':scope > text')[data.index];
            dom.setStyle(
              tooltipNode,
              'top',
              (dom.offset(sumLabel).top - containerOffset.top) + 'px'
            );
          } else {
            dom.setStyle(
              tooltipNode,
              'top',
              (dom.offset(lastGroupBar).top - containerOffset.top) + 'px'
            );
          }
          // left position
          const rect = lastGroupBar.getBoundingClientRect();
          dom.setStyle(
            tooltipNode,
            'left',
            (rect.left + rect.width / 2 - containerOffset.left) + 'px'
          );

          prepareTooltip(tooltipData, data);

          tooltipNode.classList.add('active');
        }).mouseout(() => {
          tooltipNode.classList.remove('active');
        });
      }
      if (data.type === 'point' && normalizedOptions.chartType === 'line') {
        const groupNode = data.group._node;
        const pointNode = data.element._node;
        tooltipData = data.series?.tooltipElements?.[data.index] ?? tooltipData;
        $(pointNode).mouseover(() => {
          // top position
          const rect = pointNode.getBoundingClientRect();
          const containerOffset = dom.offset(container[0]);
          if (normalizedOptions.renderAboveBarDescription) {
            const sumLabel = groupNode.querySelectorAll(':scope > text')[data.index];
            dom.setStyle(
              tooltipNode,
              'top',
              (dom.offset(sumLabel).top - containerOffset.top) + 'px'
            );
          } else {
            dom.setStyle(
              tooltipNode,
              'top',
              (rect.top - containerOffset.top) + 'px'
            );
          }
          // left position
          dom.setStyle(
            tooltipNode,
            'left',
            (rect.left + rect.width / 2 - containerOffset.left) + 'px'
          );

          prepareTooltip(tooltipData, data);

          tooltipNode.classList.add('active');
        }).mouseout(() => {
          tooltipNode.classList.remove('active');
        });
      }
      if (data.type === 'slice' && normalizedOptions.chartType === 'pie') {
        data.series.tooltipElements.forEach((element) =>
          element.className = 'no-padding'
        );
        tooltipData = data.series.tooltipElements;
        const sliceNode = $(data.element._node);
        const containerOffset = dom.offset(container[0]);
        const showTooltip = (x, y) => {
          dom.setStyles(tooltipNode, {
            top: (y - containerOffset.top - 10) + 'px',
            left: (x - containerOffset.left) + 'px',
          });

          prepareTooltip(tooltipData, data);

          tooltipNode.classList.add('active');
          chartEntry.x = x;
          chartEntry.y = y;
        };
        sliceNode.mousemove((event) => showTooltip(event.pageX, event.pageY))
          .mouseout(() => {
            tooltipNode.classList.remove('active');
            chartEntry.x = chartEntry.y = null;
          });
        chartEntry.showCallbacksTargets.push(data.element.getNode());
        chartEntry.showCallbacks.push(showTooltip);
      }
    });
  };
}

function isPluginEnabled(chart) {
  return !chart.options.disabledPlugins ||
    chart.options.disabledPlugins.indexOf('tooltip') === -1;
}

function getChartRenderEntry(chart) {
  const node = chart.container;
  let chartRender = _.find(chartsIndex, { node });
  if (!chartRender) {
    chartRender = {
      node,
      x: null,
      y: null,
      showCallbacksTargets: [],
      showCallbacks: [],
    };
    // remove not existing charts renders
    chartsIndex = chartsIndex.filter((existingChartRender) => {
      return $.contains(document.documentElement, existingChartRender.node);
    });
    chartsIndex.push(chartRender);
  }
  return chartRender;
}
