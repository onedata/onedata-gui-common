/**
 * Plugin for Chartist which sets custom colors for chartist-legend
 *
 * Options:
 * * colors - array of colors for series
 * * styles - object of css styles for a legend item colored square
 *
 * @module utils/chartist/legend-colors
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import dom from 'onedata-gui-common/utils/dom';

export default function legendColors(options) {
  return (chart) => {
    chart.on('created', () => {
      const legend = chart.container.querySelector('.ct-legend');
      if (!legend) {
        return;
      }

      options.colors.forEach((color, index) => {
        const series = legend.querySelector('.ct-series-' + index);
        if (!series) {
          return;
        }

        const colorRect = document.createElement('div');
        colorRect.classList.add('custom-color');
        dom.setStyles(colorRect, {
          position: 'absolute',
          left: '0',
          top: '0.2em',
          width: '1em',
          height: '1em',
          border: '3px solid ' + color,
          borderRadius: '3px',
          backgroundColor: color,
        });
        if (options.styles) {
          dom.setStyles(colorRect, options.styles);
        }

        [...series.querySelectorAll('.custom-color')]
        .forEach((element) => element.remove());
        series.prepend(colorRect);
      });
    });
  };
}
