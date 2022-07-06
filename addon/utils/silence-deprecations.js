/**
 * Supresses all Ember deprecations, which are visible in JavaScript browser console.
 * Deprecation messages are persisted in `window.emberDeprecations`.
 *
 * WARNING: This util should be used ONLY in case of an Ember framework upgrade to
 * ease the process of migration. After successfull upgrade all calls to this
 * util should be removed.
 *
 * @module utils/silence-deprecations
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { registerDeprecationHandler } from '@ember/debug';

let wasCalled = false;
let deprecationsOccurred = false;

export default function silenceDeprecations() {
  if (wasCalled) {
    return;
  }
  wasCalled = true;

  registerDeprecationHandler((message) => {
    if (!Array.isArray(window.emberDeprecations)) {
      window.emberDeprecations = [];
    }

    // First deprecation occurred
    if (!deprecationsOccurred) {
      console.warn('util:silence-deprecations: Some Ember deprecations occurred. See `window.emberDeprecations`.');
      deprecationsOccurred = true;
    }

    window.emberDeprecations.push(message);
  });
}
