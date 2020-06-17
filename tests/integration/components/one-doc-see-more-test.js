import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one doc see more', function () {
  setupComponentTest('one-doc-see-more', {
    integration: true,
  });

  it('renders text and link with default name if linkName is not provided', function () {
    this.render(hbs `{{one-doc-see-more docPath="world.html"}}`);
    expect(this.$().text()).to.match(/See the\s+documentation\s+for more\./);
  });

  it('renders text and link with custom name if linkName is provided', function () {
    this.render(hbs `{{one-doc-see-more linkName="foo bar" docPath="world.html"}}`);
    expect(this.$().text()).to.match(/See the\s+foo bar\s+documentation\s+for more\./);
  });

  it('renders anchor with documentation href', function () {
    this.render(hbs `{{one-doc-see-more docPath="hello/world.html"}}`);
    expect(this.$('.documentation-link')).to.have.attr(
      'href',
      'https://onedata.org/#/home/documentation/doc/hello/world.html'
    );
  });

  it('renders see more text without link with provided yielded block', function () {
    this.render(hbs `
      {{#one-doc-see-more docPath="hello/world.html"}}
        <span id="x">foo</span>
      {{/one-doc-see-more}}
    `);
    expect(this.$().text()).to.match(/See the\s+foo\s+for more\./);
    expect(this.$('.documentation-link')).to.not.exist;
    expect(this.$('#x')).exist;
  });

});
