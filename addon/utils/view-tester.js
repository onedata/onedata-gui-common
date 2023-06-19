/**
 * Instance of this class is bound to some `$container`.
 * We can now test if some child element is visible in viewport.
 *
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import $ from 'jquery';

export default class ViewTester {
  /**
   * @param {HTMLElement} container
   */
  constructor($container) {
    this.$container = $container;
  }

  /**
   * @param {HTMLElement} elem
   * @returns {boolean}
   */
  isInView(elem) {
    const elemTop = $(elem).offset().top;
    const elemBottom = elemTop + elem.offsetHeight;

    // NOTE: if there are problems with performance, move container offset
    // evaluation to constructor and invoke when window is resized
    const containerTop = this.$container.offset().top;
    const containerBottom = containerTop + this.$container[0].clientHeight;

    return (elemTop <= containerBottom) && (elemBottom >= containerTop);
  }

  /**
   * @param {HTMLElement} elem
   * @returns {boolean}
   */
  aboveView(elem) {
    return $(elem).offset().top > 0;
  }
}
