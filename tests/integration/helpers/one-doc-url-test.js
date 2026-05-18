import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';

describe('Integration | Helper | one-doc-url', function () {
  setupRenderingTest();

  it('generates valid URL when guiUtils service has no version info', async function () {
    await render(hbs `{{one-doc-url "user-guide/data-transfers"}}`);

    expect(this.element.textContent.trim()).to.equal(
      'https://onedata.org/docs/stable/user-guide/data-transfers'
    );
  });

  it('generates valid URL when guiUtils service has version info', async function () {
    lookupService(this, 'guiUtils').set('softwareVersionDetails', {
      serviceVersion: '25.2',
      serviceBuildVersion: 'aabbcc',
    });
    await render(hbs `{{one-doc-url "user-guide/data-transfers"}}`);

    expect(this.element.textContent.trim()).to.equal(
      'https://onedata.org/docs/25/user-guide/data-transfers'
    );
  });
});
