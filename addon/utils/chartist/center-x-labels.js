/**
 * Plugin for Chartist which centers x labels.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import dom from 'onedata-gui-common/utils/dom';

export default function centerXLabels() {
  return (chart) => {
    chart.on('created', () => {
      [...chart.container.querySelectorAll(
        '.ct-labels .ct-label.ct-horizontal.ct-end'
      )].forEach((element) => {
        const label = element.parentElement;
        const width = parseFloat(label.getAttribute('width'));
        dom.setStyle(label, 'transform', `translateX(-${width / 2}px)`);
      });
    });
  };
}
