import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';

describe('Integration | Component | one-doc-see-more', function () {
  setupRenderingTest();

  it('renders text and link with default name if linkName is not provided', async function () {
    await render(hbs `{{one-doc-see-more docPath="world.html"}}`);
    expect(this.element.textContent).to.match(/See the\s+documentation\s+for more\./);
  });

  it('renders text and link with custom name if linkName is provided', async function () {
    await render(hbs `{{one-doc-see-more linkName="foo bar" docPath="world.html"}}`);
    expect(this.element.textContent).to.match(/See the\s+foo bar\s+documentation\s+for more\./);
  });

  it('renders anchor with documentation href', async function () {
    lookupService(this, 'guiUtils').set('softwareVersionDetails', {
      serviceVersion: '21.02.3',
      serviceBuildVersion: 'aabbcc',
    });

    await render(hbs `{{one-doc-see-more docPath="hello/world.html"}}`);

    expect(find('.documentation-link').href).to.equal(
      'https://onedata.org/#/home/documentation/21.02/doc/hello/world.html'
    );
  });

  it('renders see more text with provided yielded block inside link', async function () {
    await render(hbs `
      {{#one-doc-see-more docPath="hello/world.html"}}
        <span id="x">foo</span>
      {{/one-doc-see-more}}
    `);
    expect(this.element.textContent).to.match(/See the\s+foo\s+for more\./);
    expect(find('.documentation-link')).to.exist;
    expect(find('#x')).exist;
  });

  it('renders link with custom href if provided', async function () {
    await render(hbs `
      {{one-doc-see-more linkName="hello" href="http://example.com"}}
    `);
    expect(find('.documentation-link'))
      .to.have.attr('href', 'http://example.com');
  });

  it('renders text with parenthesis in internal mode without spaces around', async function () {
    await render(hbs `Some -{{one-doc-see-more
      isSentencePart=true
      linkName="foo bar"
      docPath="world.html"
    }}- text`);
    expect(this.element.textContent).to.match(
      /Some -\(see the\s+foo bar\s+documentation\s+for more\)- text/
    );
  });

});
