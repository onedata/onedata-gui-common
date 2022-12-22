/**
 * Searches for appropriate column index according to mouse and columns positions.
 *
 * @module utils/chartist/identify-hovered-values-column
 * @author Michal Borzecki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import dom from 'onedata-gui-common/utils/dom';

/**
 * @param {MouseEvent} event
 * @param {object} chart Chartist object
 * @param {Array<number>} _pointsColumnXPos Array of columns positions
 * @returns {number} positive index if column has been found, -1 otherwise
 */
export default function identifyHoveredValuesColumn(event, chart, _pointsColumnXPos) {
  const chartContainer = chart.container;
  const mouseX = event.pageX - dom.offset(chartContainer).left;
  if (mouseX < _pointsColumnXPos[0] ||
    mouseX > _pointsColumnXPos[_pointsColumnXPos.length - 1] ||
    _pointsColumnXPos.length === 0) {
    return -1;
  } else {
    let targetIndex = 0;
    let targetIndexDistance = Math.abs(mouseX - _pointsColumnXPos[0]);
    for (let i = 1; i < _pointsColumnXPos.length; i++) {
      const distance = Math.abs(mouseX - _pointsColumnXPos[i]);
      if (distance < targetIndexDistance) {
        targetIndex = i;
        targetIndexDistance = distance;
      }
    }
    return targetIndex;
  }
}
