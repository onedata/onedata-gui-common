import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { tagSubstring } from 'onedata-gui-common/helpers/tag-substring';

describe('Integration | Helper | tag-substring', function () {
  setupRenderingTest();

  it('tags by making bold matching substring in text', async function () {
    const result = tagSubstring(['hello world', 'world']);
    expect(result.toString()).to.be.equal('hello <b>world</b>');
  });

  it('tags only first matching substring in text', async function () {
    const result = tagSubstring(['hello world world', 'world']);
    expect(result.toString()).to.be.equal('hello <b>world</b> world');
  });

  it('tags only first matching substring in text with custom tag', async function () {
    const result = tagSubstring(
      ['hello world world', 'world'], { isCaseSensitive: false, htmlTag: 'mark' }
    );
    expect(result.toString())
      .to.be.equal('hello <mark>world</mark> world');
  });

  it('matches are case-insensitive by default', async function () {
    const result = tagSubstring(['hello World world', 'worlD']);
    expect(result.toString()).to.be.equal('hello <b>World</b> world');
  });

  it('does not tag when case differs and isCaseSensitive is true', async function () {
    const result = tagSubstring(
      ['hello World world', 'worlD'], { isCaseSensitive: true }
    );
    expect(result.toString()).to.be.equal('hello World world');
  });

  it('renders unchanged text when no match is found', async function () {
    const result = tagSubstring(['hello world', 'hhh']);
    expect(result.toString()).to.be.equal('hello world');
  });

  it('does not match HTML entities after escaping', async function () {
    const result = tagSubstring(['<div>', 'lt']);
    expect(result.toString()).to.be.equal('<div>');
  });

  it('renders unchanged text when query is empty', async function () {
    const result = tagSubstring(['hello world', '']);
    expect(result.toString()).to.be.equal('hello world');
  });

  it('renders empty string when input is empty', async function () {
    const result = tagSubstring(['', 'world']);
    expect(result.toString()).to.be.equal('');
  });

  it('renders highlighted "<"', async function () {
    const result = tagSubstring(['<div>', '<']);
    expect(result.toString()).to.be.equal('<b>&lt;</b>div&gt;');
  });

  it('returns safe string with original HTML escaped', async function () {
    const result = tagSubstring(['<strong>Czesław</strong>', 'es']);
    expect(result.toString()).to.be.equal('&lt;strong&gt;Cz<b>es</b>ław&lt;/strong&gt;');
  });

  it('tags Unicode substring with mixed scripts and accents case-insensitively',
    async function () {
      const result = tagSubstring(['FRANÇżółНИ', 'nçŻÓŁни']);
      expect(result.toString()).to.be.equal('FRA<b>NÇżółНИ</b>');
    }
  );
});
