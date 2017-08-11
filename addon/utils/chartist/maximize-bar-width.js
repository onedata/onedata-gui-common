/**
 * Plugin for Chartist which maximizes bars width to fill available space.
 *
 * @module utils/chartist/center-line-chart
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function () {
  return (chart) => {
    chart.on('draw', (data) => {
      if (data.type === 'bar') {
        data.element.attr({
          style: `stroke-width: ${100 / (chart.data.series[0].data.length + 1)}%`,
        });
      }
    });
  };
}
