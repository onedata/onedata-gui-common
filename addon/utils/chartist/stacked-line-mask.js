/**
 * Chartist plugin that creates mask to simulate stacked line chart.
 * Warning: to use it, chart must render already "manually" stacked series
 * (each series is a sum of original values and all preceding series)
 * in descending value order.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* global Chartist */

export default function stackedLineMask() {
  return (chart) => {
    chart.on('draw', (data) => {
      if (data.type === 'area') {
        const svg = chart.svg;
        const chartId = svg.getNode().parentElement.id;
        const maskId = `series-mask-${data.seriesIndex}-${chartId}`;
        if (data.seriesIndex === 0) {
          svg.elem('defs', undefined, undefined, true);
        } else {
          const area = data.element;
          const prevArea = Chartist.Svg(
            data.group.getNode().previousElementSibling.querySelector('.ct-area')
          );
          const areaPathD = area.attr('d');
          const defs = svg.querySelector('defs');
          const mask = defs.elem('mask', { id: maskId });
          mask.elem('rect', {
            x: '0',
            y: '0',
            width: '100%',
            height: '100%',
            fill: 'white',
          });
          mask.elem('path', {
            d: areaPathD,
            fill: 'black',
          });
          prevArea.attr({ mask: `url(#${maskId})` });
        }
      }
    });
  };
}
