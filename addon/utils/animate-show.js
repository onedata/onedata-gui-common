/**
 * Launches element show animation.
 * 
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 * 
 * @param {jQuery} $element
 * @param {boolean} delayed if true, animation will be delayed
 * @returns {undefined}
 */
export default function animateShow($element, delayed = false) {
  $element
    .addClass((delayed ? 'short-delay ' : '') + 'fadeIn')
    .removeClass('hide fadeOut');
}
