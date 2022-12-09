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
 * @param {HTMLElement} topElement
 * @param {HTMLElement} leftElement
 * @param {HTMLElement} innerElement
 * @returns {Function}
 */
export default function bindElementTop({
  topElement,
  leftElement,
  innerElement,
}) {
  const staticCss = {
    position: 'fixed',
    right: 0,
    bottom: 0,
  };
  if (!leftElement) {
    staticCss.left = 0;
  }
  if (!topElement) {
    staticCss.top = 0;
  }
  dom.setStyles(innerElement, staticCss);
  const __resizeFun = () => {
    if (topElement) {
      dom.setStyle(
        innerElement,
        'top',
        (dom.offset(topElement).top + Math.max(dom.height(topElement), 0)) + 'px'
      );
    }
    if (leftElement) {
      dom.setStyle(
        innerElement,
        'left',
        (dom.offset(leftElement).left + Math.max(dom.width(leftElement), 0)) + 'px'
      );
    }
  };
  __resizeFun();
  return __resizeFun;
}
