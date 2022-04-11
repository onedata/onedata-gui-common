/**
 * Plugin for Chartist which adds axis (x and y) labels.
 *
 * Options:
 * - xLabel, yLabel - labels
 * - xLabelXOffset, xLabelYOffset, yLabelXOffset, yLabelYOffset - position
 * adjustments for x and y labels
 *
 * @module utils/chartist/axis-labels
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* global Chartist */
import $ from 'jquery';

export default function (options) {
  const defaultOptions = {
    xLabel: '',
    yLabel: '',
    xLabelXOffset: 15,
    xLabelYOffset: -20,
    yLabelXOffset: 20,
    yLabelYOffset: 20,
  };
  const chartistOptions = Chartist.extend({}, defaultOptions, options);

  return (chart) => {
    chart.on('created', function () {
      const svgNode = $(chart.svg._node);
      const axisLabelsGroup = chart.svg.elem('g', {}, 'ct-axis-labels');
      axisLabelsGroup.elem('text', {
        x: -svgNode.innerHeight() / 2 + chartistOptions.yLabelYOffset,
        y: chartistOptions.yLabelXOffset,
      }, 'ct-axis-y-label').text(chartistOptions.yLabel);
      axisLabelsGroup.elem('text', {
        x: svgNode.innerWidth() / 2 + chartistOptions.xLabelXOffset,
        y: svgNode.innerHeight() + chartistOptions.xLabelYOffset,
      }, 'ct-axis-x-label').text(chartistOptions.xLabel);
    });
  };
}
