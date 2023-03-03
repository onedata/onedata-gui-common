/**
 * Port of https://github.com/daneden/animate.css example script, but with modified API.
 * Adds animation CSS classes on element and removes them when animation completes.
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';

export default function animateCss(element, ...classes) {
  element.classList.add('animated', ...classes);

  return new Promise((resolve, reject) => {
    function handleAnimationEnd(event) {
      try {
        element.classList.remove('animated', ...classes);
        element.removeEventListener('animationend', handleAnimationEnd);
        resolve(event);
      } catch (error) {
        reject(error);
      }
    }
    try {
      element.addEventListener('animationend', handleAnimationEnd);
    } catch (error) {
      reject(error);
    }
  });
}
