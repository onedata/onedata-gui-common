import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, find } from '@ember/test-helpers';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Utility | dom/set styles', function () {
  setupRenderingTest();

  it('sets styles on a single element', async function () {
    await render(hbs`<span></span>`);

    const span = find('span');
    dom.setStyles(span, {
      display: 'flex',
      position: 'relative',
    });

    expect(span).to.have.attribute('style', 'display: flex; position: relative;');
  });

  it('sets styles on an array of elements', async function () {
    await render(hbs`<span></span><p></p>`);

    const span = find('span');
    const p = find('p');
    dom.setStyles([span, p], {
      display: 'flex',
      position: 'relative',
    });

    [span, p].forEach((element) =>
      expect(element).to.have.attribute('style', 'display: flex; position: relative;')
    );
  });

  it('sets styles on a collection of elements (from querySelectorAll)', async function () {
    await render(hbs`<span></span><p></p>`);

    const elements = this.element.querySelectorAll('span, p');
    dom.setStyles(elements, {
      display: 'flex',
      position: 'relative',
    });

    [...elements].forEach((element) =>
      expect(element).to.have.attribute('style', 'display: flex; position: relative;')
    );
  });

  it('does not throw error for nullish element reference', async function () {
    await render(hbs`<span></span>`);

    dom.setStyles(find('p'), {
      display: 'flex',
      position: 'relative',
    });
  });
});
