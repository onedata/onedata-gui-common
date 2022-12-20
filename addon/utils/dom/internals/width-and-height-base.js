/**
 * Gets the current width or height of the element. You can choose which layout box
 * you want to measure.
 *
 * It's a base implementation for `width` and `height` utils. You should not
 * use it directly.
 *
 * NOTE: Measured values does not take into account any possible content
 * overflow or scroll - the element is measured as if there was no overflow
 * (overflow is "cropped").
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import { LayoutBox } from '../enums';
import getStyleNumericValue from './get-style-numeric-value';

/**
 * @param {HTMLElement} element
 * @param {LayoutBox} whichBox
 * @param {{ axisProperty: 'width'|'height', axisStart: 'left'|'top', axisEnd: 'right'|'bottom' }}
 * @returns {number}
 */
export default function widthAndHeightBase(
  element,
  whichBox, { axisProperty, axisStart, axisEnd }
) {
  const upperAxisStart = _.upperFirst(axisStart);
  const upperAxisEnd = _.upperFirst(axisEnd);

  const boundingClientRect = element.getBoundingClientRect();
  const borderBoxSize = boundingClientRect[axisProperty];
  if (whichBox === LayoutBox.BorderBox) {
    return borderBoxSize;
  } else if (whichBox === LayoutBox.MarginBox) {
    const startMargin = Math.max(getStyleNumericValue(element, `margin${upperAxisStart}`), 0);
    const endMargin = Math.max(getStyleNumericValue(element, `margin${upperAxisEnd}`), 0);
    const marginBoxSize = borderBoxSize + startMargin + endMargin;
    return marginBoxSize;
  } else if (
    whichBox === LayoutBox.PaddingBox ||
    whichBox === LayoutBox.ContentBox
  ) {
    const startBorderWidth = getStyleNumericValue(element, `border${upperAxisStart}Width`);
    const endBorderWidth = getStyleNumericValue(element, `border${upperAxisEnd}Width`);
    const paddingBoxSize = borderBoxSize - startBorderWidth - endBorderWidth;
    if (whichBox === LayoutBox.PaddingBox) {
      return paddingBoxSize;
    } else {
      const startPadding = getStyleNumericValue(element, `padding${upperAxisStart}`);
      const endPadding = getStyleNumericValue(element, `padding${upperAxisEnd}`);
      const contentBoxSize = paddingBoxSize - startPadding - endPadding;
      return contentBoxSize;
    }
  } else {
    return borderBoxSize;
  }
}
