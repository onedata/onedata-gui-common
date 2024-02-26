import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';

describe('Integration | Helper | one-doc-url', function () {
  setupRenderingTest();

  it('generates valid URL when guiUtils service has no version info', async function () {
    await render(hbs `{{one-doc-url "hello_world.html"}}`);

    expect(this.element.textContent.trim()).to.match(
      /https?:\/\/.*\/stable\/.*hello_world\.html/
    );
  });

  it('generates valid URL when guiUtils service has version info', async function () {
    lookupService(this, 'guiUtils').set('softwareVersionDetails', {
      serviceVersion: '21.02.3',
      serviceBuildVersion: 'aabbcc',
    });
    await render(hbs `{{one-doc-url "hello_world.html"}}`);

    expect(this.element.textContent.trim()).to.match(
      /https?:\/\/.*\/21\.02\/.*hello_world\.html/
    );
  });
});
