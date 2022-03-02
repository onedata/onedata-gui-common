import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

/**
 * Special suite to force initialization of some long procedures that executed
 * first time causes timeouts in testing environment. Without it the first
 * tests (with `wait()`) sometimes timeout with default (shorter) timeout.
 */
describe('Integration | Component | warm up', function () {
  setupComponentTest('one-modal', {
    integration: true,
  });

  this.timeout(20 * 1000);

  it('runs first rendering', async function () {
    // First real test in this project has timeouts on rendering modals.
    // Rendering modal here allows to avoid these timeouts.
    this.render(hbs `{{one-modal}}`);

    await wait();
  });
});
