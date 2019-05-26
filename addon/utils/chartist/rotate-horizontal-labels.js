/**
 * Plugin for Chartist which rotates x axis labels by 45 degrees.
 *
 * @module utils/chartist/rotate-horizontal-labels
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import $ from 'jquery';

export default function () {
  return (chart) => {
    chart.on('created', () => {
      let labels = $(chart.container).find(
        '.ct-labels .ct-label.ct-horizontal.ct-end').parent();
      labels.each((index, element) => {
        let label = $(element);
        let width = parseFloat(label.attr('width'));
        let rotateX = parseFloat(label.attr('x')) + width;
        let rotateParams = `-45 ${rotateX} ${label.attr('y')}`;
        let translateParams = `-${width / Math.SQRT2} -${width / Math.SQRT2}`;
        label.attr('transform',
          `rotate(${rotateParams}) translate(${translateParams})`);
      });
    });
  };
}
