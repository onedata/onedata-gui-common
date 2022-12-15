/**
 * A plugin for Chartist which adds pie chart labels.
 *
 * Options:
 * * lineTextMargin - margin between text and line,
 * * lineLength - horizontal (next to text) line length,
 * * linePointerLength - diagonal (pointer to slice) line length,
 * * hideLabelThresholdPercent - percent below which label is hidden.
 *
 * Both lineLength and linePointerLength can be a number (means px),
 * or a percent string (relative to radius size).
 *
 * Used css classes:
 * * ct-pie-label-line - for lines,
 * * ct-pie-label-text - for text (both top and bottom),
 * * ct-pie-label-text-top - for top text
 * * ct-pie-label-text-bottom - for bottom text
 *
 * @module utils/chartist/pie-labels
 * @author Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* global Chartist */

import _ from 'lodash';
import $ from 'jquery';
import dom from 'onedata-gui-common/utils/dom';

const DEFAULT_LINE_LENGTH = '100';
const DEFAULT_LINE_POINTER_LENGTH = '50%';

let chartsIndex = [];

export default function pieLabels(options) {
  const defaultOptions = {
    lineTextMargin: 3,
    lineLength: DEFAULT_LINE_LENGTH,
    linePointerLength: DEFAULT_LINE_POINTER_LENGTH,
    hideLabelThresholdPercent: 15,
  };
  const normalizedOptions = Chartist.extend({}, defaultOptions, options);
  return (chart) => {
    chart.on('draw', (data) => {
      if (!isPluginEnabled(chart)) {
        return;
      }
      if (data.type === 'slice') {
        if (!chart.data.pieLabels[data.index]) {
          return;
        }
        const svg = chart.svg;
        const labelsGroup = getLabelsGroup(svg);
        const additionalClasses = chart.data.pieLabels[data.index].className;
        const labelGroup = svg.elem('g', {},
          'ct-pie-label ' + (additionalClasses ? additionalClasses : ''));
        labelsGroup.append(labelGroup);

        const radiansAverage = ((data.startAngle + data.endAngle) * Math.PI) / 360;
        const distance = data.radius;
        const x = data.center.x + distance * Math.sin(radiansAverage);
        const y = data.center.y - distance * Math.cos(radiansAverage);

        const lineLength = normalizeLength(
          normalizedOptions.lineLength,
          data.radius,
          DEFAULT_LINE_LENGTH
        );
        const horizDirection = x > data.center.x ? 1 : -1;
        const vertDirection = y > data.center.y ? 1 : -1;
        const pointerLineLength = normalizeLength(
          normalizedOptions.linePointerLength,
          data.radius,
          DEFAULT_LINE_POINTER_LENGTH
        );

        const pointerLineLengthX = pointerLineLength / Math.SQRT2;
        const lineX2a = x + horizDirection * pointerLineLengthX;
        const lineY2a = y + vertDirection * pointerLineLengthX;
        const lineX3a = lineX2a + horizDirection * lineLength;
        const lineY3a = lineY2a;
        const lineAttributes = {
          d: `M ${x} ${y} L ${lineX2a} ${lineY2a} L ${lineX3a} ${lineY3a}`,
          fill: 'none',
        };

        const line = labelGroup.elem('path', lineAttributes, 'ct-pie-label-line');
        labelGroup.append(line);

        addText(chart, data, normalizedOptions, labelGroup,
          lineX3a, lineY3a, horizDirection, lineLength);
        autohideLabel(data, normalizedOptions, labelGroup);
        chart.eventEmitter.emit('draw', {
          type: 'pie-label',
          element: labelGroup,
          group: labelGroup,
          index: data.index,
        });
      }
    });
    chart.on('created', () => {
      const chartRender = getChartRenderEntry(chart);
      let lastActiveTooltipTarget = _.find(
        chartRender.oldTooltipTargets,
        (target) => !!$(target).attr('aria-describedby')
      );
      if (lastActiveTooltipTarget) {
        lastActiveTooltipTarget = $(lastActiveTooltipTarget);
        const lastTooltipId = lastActiveTooltipTarget.attr('aria-describedby');
        if ($('#' + lastTooltipId).hasClass('in')) {
          // tooltip was active while rerender. Try to activate tooltip, which is
          // rendered exactly in the same place
          const dx = lastActiveTooltipTarget.attr('dx');
          const dy = lastActiveTooltipTarget.attr('dy');
          const newTarget = $(chart.container).find(`text[dx="${dx}"][dy="${dy}"]`);
          newTarget.tooltip('show');
        }
      }
      // remove all tooltips from the previous render
      chartRender.oldTooltipTargets.forEach((target) =>
        $('#' + $(target).attr('aria-describedby')).remove()
      );
      chartRender.oldTooltipTargets = chartRender.actualTooltipTargets;
      chartRender.actualTooltipTargets = [];
    });
  };
}

function isPluginEnabled(chart) {
  return !chart.options.disabledPlugins ||
    chart.options.disabledPlugins.indexOf('pieLabels') === -1;
}

function getLabelsGroup(svg) {
  let labelsGroup = svg.querySelector('.ct-pie-labels');
  if (!labelsGroup) {
    labelsGroup = svg.elem('g', {}, 'ct-pie-labels');
    svg.append(labelsGroup);
  }
  return labelsGroup;
}

function normalizeLength(length, relativeLength, defaultValue) {
  let normalizedLength;
  if (typeof length === 'string') {
    normalizedLength = length.trim();
  } else if (typeof length === 'number') {
    normalizedLength = String(length);
  } else {
    normalizedLength = String(defaultValue);
  }
  if (normalizedLength[normalizedLength.length - 1] === '%') {
    return relativeLength * (parseFloat(normalizedLength) / 100);
  } else {
    return parseFloat(normalizedLength);
  }
}

function addText(
  chart, data, options, labelGroup, x, y, horizDirection, width
) {
  const textAttributes = {
    'dx': x,
    'dy': y - options.lineTextMargin,
    'text-anchor': horizDirection > 0 ? 'end' : 'start',
    'style': 'dominant-baseline: text-after-edge;',
  };

  let textElement = labelGroup.elem(
    'text',
    textAttributes,
    'ct-pie-label-text ct-pie-label-text-top'
  );
  clipText(textElement, chart.data.pieLabels[data.index].topText, width, chart);
  labelGroup.append(textElement);

  textAttributes.dy = y + options.lineTextMargin;
  textAttributes.style = 'dominant-baseline: text-before-edge;';

  textElement = labelGroup.elem(
    'text',
    textAttributes,
    'ct-pie-label-text ct-pie-label-text-bottom'
  );
  clipText(textElement, chart.data.pieLabels[data.index].bottomText, width, chart);
  labelGroup.append(textElement);
}

function clipText(textElement, text, width, chart) {
  // some padding for readability
  const normalizedWidth = width - 5;
  textElement.text(text);
  if (textElement.width() <= normalizedWidth || text.length <= 1) {
    return;
  } else {
    // binary search of proper text length
    let upperIndex = text.length - 1;
    let lowerIndex = 1;
    let clippedText;
    while (lowerIndex !== upperIndex) {
      const newIndex = Math.ceil((upperIndex + lowerIndex) / 2);
      clippedText = text.substring(0, newIndex) + '...';
      textElement.empty().text(clippedText);
      if (textElement.width() > normalizedWidth) {
        upperIndex = newIndex - 1;
      } else {
        lowerIndex = newIndex;
      }
    }

    const chartRender = getChartRenderEntry(chart);
    chartRender.actualTooltipTargets.push(textElement.getNode());
    $(textElement.getNode()).tooltip({
      container: 'body',
      title: text,
      animation: false,
      placement: 'auto top',
    });
  }
}

function autohideLabel(data, options, labelGroup) {
  const degreesDelta = data.endAngle - data.startAngle;
  if (degreesDelta < options.hideLabelThresholdPercent * 3.6) {
    const labelGroupNode = labelGroup.getNode();
    const showLabel = () => dom.setStyle(labelGroupNode, 'display', 'initial');
    const hideLabel = () => dom.setStyle(labelGroupNode, 'display', 'none');
    hideLabel();
    $(data.element.getNode()).mouseover(showLabel).mouseout(hideLabel);
    $(labelGroupNode).mouseover(showLabel).mouseout(hideLabel);
  }
}

function getChartRenderEntry(chart) {
  const node = chart.container;
  let chartRender = _.find(chartsIndex, { node });
  if (!chartRender) {
    chartRender = {
      node,
      oldTooltipTargets: [],
      actualTooltipTargets: [],
    };
    // remove not existing charts renders
    chartsIndex = chartsIndex.filter((existingChartRender) => {
      return $.contains(document.documentElement, existingChartRender.node);
    });
    chartsIndex.push(chartRender);
  }
  return chartRender;
}
