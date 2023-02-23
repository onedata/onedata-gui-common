import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find } from '@ember/test-helpers';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Utility | dom/set-style', function () {
  setupRenderingTest();

  it('sets style on a single element', async function () {
    await render(hbs`<span></span>`);

    const span = find('span');
    dom.setStyle(span, 'display', 'flex');

    expect(span).to.have.attribute('style', 'display: flex;');
  });

  it('sets style on an array of elements', async function () {
    await render(hbs`<span></span><p></p>`);

    const span = find('span');
    const p = find('p');
    dom.setStyle([span, p], 'display', 'flex');

    [span, p].forEach((element) =>
      expect(element).to.have.attribute('style', 'display: flex;')
    );
  });

  it('sets style on a collection of elements (from querySelectorAll)', async function () {
    await render(hbs`<span></span><p></p>`);

    const elements = this.element.querySelectorAll('span, p');
    dom.setStyle(elements, 'display', 'flex');

    [...elements].forEach((element) =>
      expect(element).to.have.attribute('style', 'display: flex;')
    );
  });

  it('does not throw error for nullish element reference', async function () {
    await render(hbs`<span></span>`);

    dom.setStyle(find('p'), 'display', 'flex');
  });
});
