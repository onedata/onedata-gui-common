/**
 * Reexports all DOM utilities. Typical usage:
 * ```
 * import dom from 'onedata-gui-common/utils/dom';
 * dom.isVisible(...);
 * ```
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { LayoutBox } from './enums';

import isVisible from './is-visible';
import isHidden from './is-hidden';

import width from './width';
import height from './height';
import offset from './offset';

import getStyle from './get-style';
import setStyle from './set-style';
import setStyles from './set-styles';

export default {
  LayoutBox,

  isVisible,
  isHidden,

  width,
  height,
  offset,

  getStyle,
  setStyle,
  setStyles,
};
