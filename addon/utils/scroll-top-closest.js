/**
 * Scroll fitst found container in ancestor to top. By default search for perfect-scroll.
 * Optionally a scroll-container selector can be given. 
 *
 * @module utils/scroll-top-closest
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function scrollTopClosest(element, options = {}) {
  const parentSelector = options.parentSelector || '.ps';
  const smooth = options.smooth !== undefined ? options.smooth : true;
  const scrollableParent = element.closest(parentSelector);
  if (scrollableParent) {
    scrollableParent.scroll({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }
}
