import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';

describe('Integration | Component | one-doc-see-more', function () {
  setupRenderingTest();

  it('renders text and link with default name if linkName is not provided', async function () {
    await render(hbs `<OneDocSeeMore @docPath="world.html" />`);
    expect(this.element.textContent).to.match(/See the\s+documentation\s+for more\./);
  });

  it('renders text and link with custom name if linkName is provided', async function () {
    await render(hbs `<OneDocSeeMore @linkName="foo bar" @docPath="world.html" />`);
    expect(this.element.textContent).to.match(/See the\s+foo bar\s+documentation\s+for more\./);
  });

  it('renders see more text with provided yielded block inside link', async function () {
    await render(hbs `
      <OneDocSeeMore @docPath="hello/world.html">
        <span id="x">foo</span>
      </OneDocSeeMore>
    `);
    expect(this.element.textContent).to.match(/See the\s+foo\s+for more\./);
    expect(find('.documentation-link')).to.exist;
    expect(find('#x')).exist;
  });

  it('renders link with custom href if provided', async function () {
    await render(hbs `
      <OneDocSeeMore @linkName="hello" @href="http://example.com" />
    `);
    expect(find('.documentation-link'))
      .to.have.attr('href', 'http://example.com');
  });

  it('renders text with parenthesis in internal mode without spaces around', async function () {
    await render(hbs `Some -<OneDocSeeMore
      @isSentencePart={{true}}
      @linkName="foo bar"
      @docPath="world.html"
    />- text`);
    expect(this.element.textContent).to.match(
      /Some -\(see the\s+foo bar\s+documentation\s+for more\)- text/
    );
  });

  const versionMapping = [{
      full: '21.02.3',
      docs: '21.02',
    },
    {
      full: '25.0',
      docs: '25',
    },
    {
      full: '25.1.3',
      docs: '25',
    },
  ];

  for (const version of versionMapping) {
    it(`renders anchor with documentation href (version: ${version.full})`, async function () {
      lookupService(this, 'guiUtils').set('softwareVersionDetails', {
        serviceVersion: version.full,
        serviceBuildVersion: 'aabbcc',
      });

      await render(hbs `<OneDocSeeMore @docPath="hello/world.html" />`);

      expect(find('.documentation-link').href).to.equal(
        `https://onedata.org/#/home/documentation/${version.docs}/hello/world.html`
      );
    });

    it(`renders link with topic href if topic is provided (version: ${version.full})`, async function () {
      lookupService(this, 'guiUtils').set('softwareVersionDetails', {
        serviceVersion: version.full,
        serviceBuildVersion: 'aabbcc',
      });

      await render(hbs `
        <OneDocSeeMore @linkName="hello" @topic="tokens" />
      `);

      expect(find('.documentation-link')).to.have.attr(
        'href',
        `https://onedata.org/#/home/documentation/topic/${version.docs}/tokens`
      );
    });
  }

  it('renders link with "stable" version string if guiUtils softwareVersionDetails are unavailable',
    async function () {
      lookupService(this, 'guiUtils').set('softwareVersionDetails', undefined);

      await render(hbs `
        <OneDocSeeMore @linkName="hello" @topic="tokens" />
      `);

      expect(find('.documentation-link'))
        .to.have.attr('href', 'https://onedata.org/#/home/documentation/topic/stable/tokens');
    }
  );
});
