/**
 * Resolves when Ember finished render and browser has rendered animation frame.
 *
 * Useful to use with async/await to wait for render.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { schedule } from '@ember/runloop';
import { Promise } from 'rsvp';

export default function waitForRender() {
  return new Promise(resolve => {
    schedule('afterRender', this, () => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}
