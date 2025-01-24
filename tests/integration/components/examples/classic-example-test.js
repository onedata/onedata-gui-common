import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | examples/classic-example', function () {
  setupRenderingTest();

  it('renders text from i18n', async function () {
    await render(hbs`<Examples::ClassicExample />`);

    expect(this.element.textContent.trim()).to.match(/classic-foo\s+classic-bar/);
  });
});
