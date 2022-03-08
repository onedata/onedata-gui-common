import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

/**
 * Special suite to force initialization of some long procedures that executed
 * first time causes timeouts in testing environment. Without it the first
 * tests (with `settled()`) sometimes timeout with default (shorter) timeout.
 */
describe('Integration | Component | warm up', function () {
  setupRenderingTest();

  this.timeout(20 * 1000);

  it('runs first rendering', async function () {
    // First real test in this project has timeouts on rendering modals.
    // Rendering modal here allows to avoid these timeouts.
    await render(hbs `{{one-modal}}`);

    await settled();
  });
});
