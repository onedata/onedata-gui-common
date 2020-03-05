import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Helper | one doc url', function () {
  setupComponentTest('one-doc-url', {
    integration: true,
  });

  it('generates valid URL', function () {
    this.render(hbs `{{one-doc-url "hello_world.html"}}`);

    expect(this.$().text().trim()).to.match(/https?:\/\/.*\/hello_world\.html/);
  });
});
