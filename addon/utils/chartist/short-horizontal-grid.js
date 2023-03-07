/**
 * Plugin for Chartist which shorten horizontal grid to the specified height and place it in the middle of the x axis.
 *
 * Options:
 * - height - height of the horizontal grid
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* global Chartist */

import $ from 'jquery';

export default function shortHorizontalGrid(options) {
  return (chart) => {
    const defaultOptions = {
      height: 6,
    };
    const normalizedOptions = Chartist.extend({}, defaultOptions, options);

    chart.on('created', () => {
      const gridLines = $(chart.container).find('.ct-grid.ct-horizontal');
      const oldY2 = parseFloat(gridLines.first().attr('y2'));
      gridLines.each((index, element) => {
        $(element).attr('y1', oldY2 - normalizedOptions.height / 2);
        $(element).attr('y2', oldY2 + normalizedOptions.height / 2);
      });
    });
  };
}
