/**
 * Launches element hide animation.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @param {jQuery} $element
 * @returns {undefined}
 */
export default function animateHide($element) {
  $element.addClass('fadeOut').removeClass('short-delay fadeIn');
}
