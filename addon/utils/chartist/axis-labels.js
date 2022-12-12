/**
 * Plugin for Chartist which adds axis (x and y) labels.
 *
 * Options:
 * - xLabel, yLabel - labels
 * - xLabelXOffset, xLabelYOffset, yLabelXOffset, yLabelYOffset - position
 * - yAlignment - 'left' (default) or 'right' - y axis label alignment
 * adjustments for x and y labels
 *
 * @module utils/chartist/axis-labels
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* global Chartist */
import $ from 'jquery';

export default function axisLabels(options) {
  const defaultOptions = {
    xLabel: '',
    yLabel: '',
    xLabelXOffset: 15,
    xLabelYOffset: -20,
    yLabelXOffset: 20,
    yLabelYOffset: 20,
    yAlignment: 'left',
  };

  return (chart) => {
    chart.on('created', function () {
      const normalizedOptions = Chartist.extend({}, defaultOptions, options);
      const dataAxisLabels = chart.data.axisLabels;
      if (dataAxisLabels) {
        normalizedOptions.xLabel = dataAxisLabels.xLabel;
        normalizedOptions.yLabel = dataAxisLabels.yLabel;
      }
      const svgNode = $(chart.svg._node);
      const axisLabelsGroup = chart.svg.elem('g', {}, 'ct-axis-labels');
      axisLabelsGroup.elem('text', {
        x: (normalizedOptions.yAlignment === 'right' ? -1 : 1) *
          (-svgNode.innerHeight() / 2 + normalizedOptions.yLabelYOffset),
        y: normalizedOptions.yAlignment === 'right' ? -svgNode.innerWidth() -
          normalizedOptions.yLabelXOffset : normalizedOptions.yLabelXOffset,
      }, 'ct-axis-y-label ' + normalizedOptions.yAlignment).text(normalizedOptions.yLabel);
      axisLabelsGroup.elem('text', {
        x: svgNode.innerWidth() / 2 + normalizedOptions.xLabelXOffset,
        y: svgNode.innerHeight() + normalizedOptions.xLabelYOffset,
      }, 'ct-axis-x-label').text(normalizedOptions.xLabel);
    });
  };
}
