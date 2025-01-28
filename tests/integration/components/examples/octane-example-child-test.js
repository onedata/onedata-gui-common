import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | examples/octane-example-child', function () {
  setupRenderingTest();

  it('renders text with overriden i18n', async function () {
    await render(hbs`<Examples::OctaneExampleChild />`);

    expect(this.element.textContent.trim()).to.match(/FóChild\s+BąrChild/);
  });
});
