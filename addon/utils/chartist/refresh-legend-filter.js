/**
 * Plugin for Chartist which filters chart data (using chartist legend) after
 * data refresh (because Chartist legend does not detect data change by default).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import $ from 'jquery';

export default function () {
  return (chart) => {
    chart.on('data', () => {
      const legendNodes = $(chart.container).find('.ct-legend li');
      $(legendNodes[0]).click().click();
    });
  };
}
