/**
 * Gets the current width or height of the element. You can choose which layout box
 * you want to measure.
 *
 * It's a base implementation for `width` and `height` utils. You should not
 * use it directly.
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
    const marginStart = Math.max(getStyleNumericValue(element, `margin${upperAxisStart}`), 0);
    const marginEnd = Math.max(getStyleNumericValue(element, `margin${upperAxisEnd}`), 0);
    const marginBoxSize = borderBoxSize + marginStart + marginEnd;
    return marginBoxSize;
  } else if (
    whichBox === LayoutBox.PaddingBox ||
    whichBox === LayoutBox.ContentBox
  ) {
    const borderStartWidth = getStyleNumericValue(element, `border${upperAxisStart}Width`);
    const borderEndWidth = getStyleNumericValue(element, `border${upperAxisEnd}Width`);
    const paddingBoxSize = borderBoxSize - borderStartWidth - borderEndWidth;
    if (whichBox === LayoutBox.PaddingBox) {
      return paddingBoxSize;
    } else {
      const paddingStart = getStyleNumericValue(element, `padding${upperAxisStart}`);
      const paddingEnd = getStyleNumericValue(element, `padding${upperAxisEnd}`);
      const contentBoxSize = paddingBoxSize - paddingStart - paddingEnd;
      return contentBoxSize;
    }
  } else {
    return borderBoxSize;
  }
}
