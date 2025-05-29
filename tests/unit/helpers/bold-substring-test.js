import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { boldSubstring } from 'onedata-gui-common/helpers/bold-substring';

describe('Integration | Helper | bold-substring', function () {
  setupRenderingTest();

  it('highlights by making bold matching substring in text', async function () {
    const result = boldSubstring(['hello world', 'world']);
    expect(result.toString()).to.be.equal('hello <b>world</b>');
  });

  it('highlights only first matching substring in text', async function () {
    const result = boldSubstring(['hello world world', 'world']);
    expect(result.toString()).to.be.equal('hello <b>world</b> world');
  });

  it('renders unchanged text when no match is found', async function () {
    const result = boldSubstring(['hello world', 'hhh']);
    expect(result.toString()).to.be.equal('hello world');
  });

  it('renders unchanged text when no case-sensitive match is found', async function () {
    const result = boldSubstring(['hello world', 'World']);
    expect(result.toString()).to.be.equal('hello world');
  });

  it('does not highlight matches inside HTML entities', async function () {
    const result = boldSubstring(['<div>', 'lt']);
    expect(result.toString()).to.be.equal('<div>');
  });

  it('renders unchanged text when query is empty', async function () {
    const result = boldSubstring(['hello world', '']);
    expect(result.toString()).to.be.equal('hello world');
  });

  it('renders empty string when input is empty', async function () {
    const result = boldSubstring(['', 'world']);
    expect(result.toString()).to.be.equal('');
  });

  it('renders highlights "<"', async function () {
    const result = boldSubstring(['<div>', '<']);
    expect(result.toString()).to.be.equal('<b>&lt;</b>div&gt;');
  });
});
