/**
 * An utils for binding fixed position of an element to other element that is on top
 *
 * @module utils/bind-element-top
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import dom from 'onedata-gui-common/utils/dom';

/**
 * Makes `innerElement` fixed to be fully stretched below `topElement`
 * and fully streched to the right from `leftElement`.
 * Can be used without top or left element.
 *
 * @export
 * @param {JQuery} $topElement
 * @param {JQuery} $leftElement
 * @param {JQuery} $innerElement
 * @returns {Function}
 */
export default function bindElementTop({
  $topElement,
  $leftElement,
  $innerElement,
}) {
  const staticCss = {
    position: 'fixed',
    right: 0,
    bottom: 0,
  };
  if (!$leftElement || !$leftElement.length) {
    staticCss.left = 0;
  }
  if (!$topElement || !$topElement.length) {
    staticCss.top = 0;
  }
  dom.setStyles($innerElement[0], staticCss);
  const __resizeFun = () => {
    if ($topElement && $topElement.length) {
      dom.setStyle(
        $innerElement[0],
        'top',
        ($topElement.offset().top + Math.max($topElement.outerHeight(), 0)) + 'px'
      );
    }
    if ($leftElement && $leftElement.length) {
      dom.setStyle(
        $innerElement[0],
        'left',
        ($leftElement.offset().left + Math.max($leftElement.outerWidth(), 0)) + 'px'
      );
    }
  };
  __resizeFun();
  return __resizeFun;
}
