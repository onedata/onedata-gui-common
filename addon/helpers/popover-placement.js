/**
 * Helps generating placement class for popover. Currently it only supports 
 * horizontal popovers. Required options:
 * x - x position of the popover trigger relative to the container
 * y - y position of the popover trigger relative to the container
 * width - width of the container
 * height - height of the container
 *
 * @module helpers/popover-placement
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

export function popoverPlacement(params, hash) {
  const {
    x,
    y,
    width,
    height,
  } = hash;
  const centerX = width / 2;
  const hAlign = x > centerX ? 'left' : 'right';
  const vAlign = y > (height / 3 * 2) ? 'top' : y > (height / 3) ? undefined : 'bottom';
  return vAlign ? `${hAlign}-${vAlign}` : hAlign;
}

export default helper(popoverPlacement);
