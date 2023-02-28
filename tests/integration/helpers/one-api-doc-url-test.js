import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Helper | one-api-doc-url', function () {
  setupRenderingTest();

  it('generates valid URL without anchor with stable version as default', async function () {
    await render(hbs `{{one-api-doc-url product="oneprovider"}}`);

    expect(this.element.textContent.trim()).to.equal(
      'https://onedata.org/#/home/api/stable/oneprovider'
    );
  });

  it('generates valid URL without anchor with specified version', async function () {
    await render(hbs `{{one-api-doc-url product="oneprovider" version="latest"}}`);

    expect(this.element.textContent.trim()).to.equal(
      'https://onedata.org/#/home/api/latest/oneprovider'
    );
  });

  it('generates valid URL with anchor', async function () {
    await render(hbs `
      {{one-api-doc-url product="oneprovider" anchor="tag/File-registration"}}
    `);

    expect(this.element.textContent.trim())
      .to.equal(
        'https://onedata.org/#/home/api/stable/oneprovider?anchor=tag/File-registration'
      );
  });
});
