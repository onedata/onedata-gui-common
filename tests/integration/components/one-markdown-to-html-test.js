import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import globals from 'onedata-gui-common/utils/globals';

describe('Integration | Component | one-markdown-to-html', function () {
  setupRenderingTest();

  describe('renders HTML generated from Markdown', function () {
    it('with basic tags', async function () {
      this.set('markdown', `# Header

## Second level

Some text

[Link1](https://onedata.org)

<a>Link2</a>
      `);

      await render(hbs `{{one-markdown-to-html markdown=markdown}}`);

      const html = this.element.innerHTML;
      expect(html).to.match(/<h1.*?>\s*Header\s*<\/h1>/);
      expect(html).to.match(/<h2.*?>\s*Second level\s*<\/h2>/);
      expect(html).to.match(/<a.+?href="https:\/\/onedata\.org".*?>\s*Link1\s*<\/a>/);
      expect(html).to.match(/<a.*?>Link2<\/a>/);
      expect(html).to.contain('Some text');
    });

    it('with open new window links', async function () {
      this.set('markdown', '[onedata](https://onedata.org)');

      await render(hbs `{{one-markdown-to-html markdown=markdown}}`);

      const html = this.element.innerHTML;
      expect(html).to.contain('target="_blank"');
    });

    it('with open new window links for HTML a-tag', async function () {
      this.set('markdown', '<a href="https://onedata.org">hello</a>');

      await render(hbs `{{one-markdown-to-html markdown=markdown}}`);

      const html = this.element.innerHTML;
      expect(html).to.contain('target="_blank"');
    });

    it('with auto-created links', async function () {
      this.set('markdown', 'https://onedata.org');

      await render(hbs `{{one-markdown-to-html markdown=markdown}}`);

      const html = this.element.innerHTML;
      expect(html).to.contain('href="https://onedata.org"');
    });

    it('with strikethrough', async function () {
      this.set('markdown', '~~cancel~~');

      await render(hbs `{{one-markdown-to-html markdown=markdown}}`);

      const html = this.element.innerHTML;
      expect(html).to.contain('<del>cancel</del>');
    });
  });

  describe('sanitizes output HTML against', function () {
    const propertyName = 'markdownSecurityTest';

    function clearWindowEnv() {
      delete globals.window[propertyName];
    }

    beforeEach(function () {
      this.set('attackingJs', `window.${propertyName}=1;`);
      clearWindowEnv();
    });

    afterEach(function () {
      clearWindowEnv();
    });

    it('JS in anchor href', async function () {
      const js = this.get('attackingJs');
      this.set('markdown', `<a href="javascript:${js}">link</a>`);

      await render(hbs `{{one-markdown-to-html markdown=markdown}}`);

      await click('a');

      const html = this.element.innerHTML;
      expect(globals.window[propertyName], `window.${propertyName}`).to.be.undefined;
      expect(html).to.not.contain(js);
    });

    it('JS in anchor onclick', async function () {
      const js = this.get('attackingJs');
      this.set('markdown', `<a onclick="${js}">link</a>`);

      await render(hbs `{{one-markdown-to-html markdown=markdown}}`);

      await click('a');

      const html = this.element.innerHTML;
      expect(globals.window[propertyName], `window.${propertyName}`).to.be.undefined;
      expect(html).to.not.contain(js);
    });

    it('script tag execution', async function () {
      const js = this.get('attackingJs');
      this.set(
        'markdown',
        `<script type="text/javascript">${js}</script>`
      );

      await render(hbs `{{one-markdown-to-html markdown=markdown}}`);

      const html = this.element.innerHTML;
      expect(globals.window[propertyName], `window.${propertyName}`).to.be.undefined;
      expect(html).to.not.contain(js);
    });
  });
});
