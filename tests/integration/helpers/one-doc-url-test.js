import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Helper | one doc url', function () {
  setupRenderingTest();

  it('generates valid URL', async function () {
    await render(hbs `{{one-doc-url "hello_world.html"}}`);

    expect(this.$().text().trim()).to.match(/https?:\/\/.*\/hello_world\.html/);
  });
});
