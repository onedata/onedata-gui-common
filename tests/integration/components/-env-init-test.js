import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

/**
 * Test suite used to "initialize" testing environment before the real tests.
 * Without it the first tests (with `wait()`) sometimes timeout.
 */
describe('Integration | Component | env init', function () {
  setupComponentTest('one-modal', {
    integration: true,
  });

  this.timeout(20 * 1000);

  it('runs first rendering', async function () {
    this.render(hbs `{{one-modal}}`);

    await wait();
  });
});
