/**
 * Plugin for Chartist which adds additional label on the right side of the x-axis.
 *
 * Options:
 * - xOffsetMultiply - label will be moved right by xOffsetMultiply
 * (default width of a label)
 * - insertBefore - label will be inserted before last label node
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* global Chartist */
import $ from 'jquery';

export default function additionalXLabel(options) {
  const defaultOptions = {
    xOffsetMultiply: 1,
    insertBefore: false,
  };
  const normalizedOptions = Chartist.extend({}, defaultOptions, options);
  return (chart) => {
    chart.on('created', () => {
      const labelsNode = $(chart.svg._node).find('.ct-labels');
      const labels = labelsNode.find('.ct-label.ct-horizontal.ct-end');
      if (!labels.length) {
        return;
      }
      const lastLabelNode =
        $(labelsNode.find('.ct-label.ct-horizontal.ct-end').last()[0].parentElement);
      let sourceLabelNode = lastLabelNode;
      if (labels.length > 1) {
        sourceLabelNode = $(labels[labels.length - 2].parentElement);
      }

      const newLabelNode = sourceLabelNode.clone();
      newLabelNode.attr('x',
        parseFloat(lastLabelNode.attr('x')) +
        normalizedOptions.xOffsetMultiply * parseFloat(sourceLabelNode.attr('width'))
      );
      newLabelNode.find('span').text(chart.data.lastLabel);
      if (!normalizedOptions.insertBefore) {
        newLabelNode.insertAfter(lastLabelNode);
      } else {
        newLabelNode.insertBefore(lastLabelNode);
      }
    });
  };
}
