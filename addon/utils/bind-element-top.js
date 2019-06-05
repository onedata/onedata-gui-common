/**
 * An utils for binding fixed position of an element to other element that is on top
 *
 * @module utils/bind-element-top
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * Makes `belowElement` fixed to be fully stretched below `aboveElement`
 * 
 * @export
 * @param {JQuery} $topElement
 * @param { JQuery } $innerElement
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
  $innerElement.css(staticCss);
  let __resizeFun = () => {
    if ($topElement && $topElement.length) {
      $innerElement.css(
        'top',
        ($topElement.offset().top + Math.max($topElement.outerHeight(), 0)) + 'px'
      );
    }
    if ($leftElement && $leftElement.length) {
      $innerElement.css(
        'left',
        ($leftElement.offset().left + Math.max($leftElement.outerWidth(), 0)) + 'px'
      );
    }
  };
  __resizeFun();
  return __resizeFun;
}
