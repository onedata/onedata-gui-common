/**
 * Adds a  special test using Ember internal SYNC_OBSERVERS Map that should be empty after
 * all other tests. See documentation of `test-support/helpers/check-sync-observers` for
 * details.
 *
 * The `zzz-` prefix of the file guaranees, that the test will be invoked as the last
 * test.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import checkSyncObservers from './helpers/check-sync-observers';

describe('check-sync-observers', function () {
  setupTest();
  it('has 0 entries in SYNC_OBSERVERS', function () {
    checkSyncObservers();
  });
});
