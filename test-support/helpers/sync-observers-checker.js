/**
 * Provides a special test using Ember internal SYNC_OBSERVERS Map that should be empty
 * after all other tests.
 *
 * In the Ember v3.16, the Ember object without container using synchronous observer must
 * be destroyed after use. Otherwise entry for its observer stays forever in the internal
 * SYNC_OBSERVERS Map, which is initialized in the `@ember/-internals/metal/index.js`
 * module.
 *
 * Note, that this test works with private API of Ember and can stop work after any Ember
 * upgrade.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { expect } from 'chai';

/* global Ember */

export default class SyncObserversChecker {
  constructor() {
    const metalModule = Ember.__loader.require('@ember/-internals/metal/index');
    this.syncObservers = metalModule.SYNC_OBSERVERS;
  }
  assertEmptySyncObservers() {
    try {
      expect(
        this.syncObservers.size,
        'internal SYNC_OBSERVERS Map should be empty (after end of test) - review the object printed in the JS console'
      ).to.equal(0);
    } catch (error) {
      console.log('SYNC_OBSERVERS:');
      console.dir(this.syncObservers);
      throw error;
    }
  }
}
