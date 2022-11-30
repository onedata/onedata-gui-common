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

import isVisible from './is-visible';
import isHidden from './is-hidden';

import getStyle from './get-style';
import setStyle from './set-style';
import setStyles from './set-styles';

export default {
  isVisible,
  isHidden,

  getStyle,
  setStyle,
  setStyles,
};
