/**
 * Scroll first found container in ancestor to top. By default search for perfect-scroll.
 * Optionally a scroll-container selector can be given.
 *
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {Element} element
 * @param {Object} options
 * @param {String} options.parentSelector
 * @param {Boolean} options.smooth
 */
export default function scrollTopClosest(
  element, {
    parentSelector = '.ps',
    smooth = true,
  } = {}
) {
  const scrollableParent = element.closest(parentSelector);
  if (scrollableParent) {
    scrollableParent.scroll({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }
}
