import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';
import { defineProperty } from '@ember/object';

describe('Integration | Helper | one-api-doc-url', function () {
  setupRenderingTest();

  it('generates valid URL with current product, current version, and no path', async function () {
    // given
    mockProduct(this, 'onezone');
    mockVersion(this, '25.2');

    // when
    await render(hbs`{{one-api-doc-url}}`);

    // then
    expectUrl(this, 'https://onedata.org/api/25.2/onezone');
  });

  it('generates valid URL with current product, current version, and given path', async function () {
    // given
    mockProduct(this, 'oneprovider');
    mockVersion(this, '25.2');

    // when
    await render(hbs`{{one-api-doc-url path="operation/set_xattr"}}`);

    // then
    expectUrl(this, 'https://onedata.org/api/25.2/oneprovider/operation/set_xattr');
  });

  it('generates valid URL with current product, given version, and given path', async function () {
    // given
    mockProduct(this, 'onezone');

    // when
    await render(hbs`{{one-api-doc-url version="25.4" path="operation/get_user"}}`);

    // then
    expectUrl(this, 'https://onedata.org/api/25.4/onezone/operation/get_user');
  });

  it('generates valid URL with given product, given version, and given path', async function () {
    await render(hbs `
      {{one-api-doc-url product="oneprovider" version="21.02.3" path="tag/file-registration"}}
    `);

    expectUrl(this, 'https://onedata.org/api/21.02.3/oneprovider/tag/file-registration');
  });
});

function expectUrl(mochaContext, url) {
  expect(mochaContext.element.textContent.trim()).to.equal(url);
}

/**
 * @param {Mocha.Context} mochaContext
 * @param {import('../../../addon/services/gui-utils').ProductType} product
 */
function mockProduct(mochaContext, product) {
  const guiUtils = lookupService(mochaContext, 'guiUtils');
  guiUtils.set('productTypeId', product);
}

/**
 * @param {Mocha.Context} mochaContext
 * @param {string} version
 */
function mockVersion(mochaContext, version) {
  const guiUtils = lookupService(mochaContext, 'guiUtils');
  defineProperty(guiUtils, 'softwareVersionDetails', {
    get() {
      return {
        serviceVersion: version,
        serviceBuildVersion: '000000-x',
      };
    },
  });
}
