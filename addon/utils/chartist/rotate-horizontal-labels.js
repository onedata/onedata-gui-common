/**
 * Plugin for Chartist which rotates x axis labels by 45 degrees.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function rotateHorizontalLabels() {
  return (chart) => {
    chart.on('created', () => {
      [...chart.container.querySelectorAll(
        '.ct-labels .ct-label.ct-horizontal.ct-end'
      )].forEach((element) => {
        const label = element.parentElement;
        const width = parseFloat(label.getAttribute('width'));
        const rotateX = parseFloat(label.getAttribute('x')) + width;
        const rotateParams = `-45 ${rotateX} ${label.getAttribute('y')}`;
        const translateParams = `-${width / Math.SQRT2} -${width / Math.SQRT2}`;
        label.setAttribute(
          'transform',
          `rotate(${rotateParams}) translate(${translateParams})`
        );
      });
    });
  };
}
