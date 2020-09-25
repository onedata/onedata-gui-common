import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Helper | one api doc url', function () {
  setupComponentTest('one-doc-url', {
    integration: true,
  });

  it('generates valid URL without anchor', function () {
    this.render(hbs `{{one-api-doc-url product="oneprovider"}}`);

    expect(this.$().text().trim()).to.equal(
      'https://onedata.org/#/home/api/stable/oneprovider'
    );
  });

  it('generates valid URL with anchor', function () {
    this.render(hbs `
      {{one-api-doc-url product="oneprovider" anchor="tag/File-registration"}}
    `);

    expect(this.$().text().trim())
      .to.equal('https://onedata.org/#/home/api/stable/oneprovider?anchor=tag/File-registration');
  });
});
