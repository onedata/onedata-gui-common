/**
 * Gets the current width of the element. You can choose which layout box
 * you want to measure (default is border box).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import widthAndHeightBase from './internals/width-and-height-base';
import { LayoutBox } from './enums';

/**
 * @param {HTMLElement} element
 * @param {LayoutBox} layoutBox
 * @returns {number}
 */
export default function width(element, whichBox = LayoutBox.BorderBox) {
  return widthAndHeightBase(element, whichBox, {
    axisProperty: 'width',
    axisStart: 'left',
    axisEnd: 'right',
  });
}
