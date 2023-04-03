import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component | one-tile', function () {
  setupRenderingTest();

  it('renders tile title', async function () {
    await render(hbs `{{one-tile title="hello"}}`);
    expect(this.element.textContent).to.match(/.*hello.*/);
  });
});
