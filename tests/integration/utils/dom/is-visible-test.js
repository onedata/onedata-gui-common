import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Utility | dom/is-visible', function () {
  setupRenderingTest();

  it('returns true for a button', async function () {
    await render(hbs`<button></button>`);

    expect(dom.isVisible(find('button'))).to.be.true;
  });

  it('returns true for an empty paragraph', async function () {
    await render(hbs`<p></p>`);

    expect(dom.isVisible(find('p'))).to.be.true;
  });

  it('returns true for a transparent button', async function () {
    await render(hbs`<button style="opacity: 0"></button>`);

    expect(dom.isVisible(find('button'))).to.be.true;
  });

  it('returns true for a button with "visibility: hidden"', async function () {
    await render(hbs`<button style="visibility: hidden;"></button>`);

    expect(dom.isVisible(find('button'))).to.be.true;
  });

  it('returns false for a button with "display: none"', async function () {
    await render(hbs`<button style="display: none;"></button>`);

    expect(dom.isVisible(find('button'))).to.be.false;
  });

  it('returns false for a button detached from the document', async function () {
    const button = document.createElement('button');

    expect(dom.isVisible(button)).to.be.false;
  });
});
