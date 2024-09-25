/**
 * A special test using Ember internal SYNC_OBSERVERS Map that should be empty after
 * all other tests.
 *
 * In the Ember v3.16, the Ember object without container using synchronous observer
 * must be destroyed after use. Otherwise entry for its observer stays forever in the
 * internal SYNC_OBSERVERS Map, which is initialized in the
 * `@ember/-internals/metal/index.js` module.
 *
 * Note, that this test works with private API of Ember and can stop work after any
 * Ember upgrade.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

/* global Ember */

// The special `{last}` name in test guarantees that it will be invoked after all other
// tests (the `{` character is after `z` in ASCII)
describe('{last} | check-sync-observers', function () {
  setupTest();
  it('has 0 entries in SYNC_OBSERVERS at the end of tests', function () {
    const metalModule = Ember.__loader.require('@ember/-internals/metal/index');
    const { SYNC_OBSERVERS } = metalModule;
    expect(
      SYNC_OBSERVERS.size,
      'internal SYNC_OBSERVERS Map should be empty after end of tests'
    ).to.equal(0);
  });
});
