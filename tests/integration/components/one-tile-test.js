import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one tile', function () {
  setupRenderingTest();

  it('renders tile title', async function () {
    await render(hbs `{{one-tile title="hello"}}`);
    expect(this.$().text()).to.match(/.*hello.*/);
  });
});
