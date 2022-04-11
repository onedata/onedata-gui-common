/**
 * Plugin for Chartist which displays values sum above bars in bar charts.
 *
 * if ignoreZero option is true, then sum equal to zero will not be displayed
 *
 * @module utils/chartist/bar-sum-labels
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* global Chartist */

export default function (options) {
  const defaultOptions = {
    ignoreZero: true,
  };
  const chartistOptions = Chartist.extend({}, defaultOptions, options);
  return (chart) => {
    chart.on('draw', (data) => {
      if (data.type === 'bar') {
        if (data.seriesIndex === chart.data.series.length - 1) {
          const sum = chart.data.series.map(s => s.data[data.index])
            .reduce((prev, next) => prev + next, 0);
          let hiddenClass = '';
          if (chartistOptions.ignoreZero && sum === 0) {
            hiddenClass = ' hidden';
          }
          data.group.elem('text', {
            x: data.x1,
            y: data.y2,
          }, 'ct-bar-sum' + hiddenClass).text(sum);
        }
      }
    });
  };
}
