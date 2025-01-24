import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | examples/octane-example', function () {
  setupRenderingTest();

  it('renders text with i18n', async function () {
    await render(hbs`<Examples::OctaneExample />`);

    expect(this.element.textContent.trim()).to.match(/Fó\s+Bąr/);
  });
});
