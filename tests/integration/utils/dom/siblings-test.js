import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { render, find, findAll } from '@ember/test-helpers';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Utility | dom/siblings', function () {
  setupRenderingTest();

  it('returns element\'s siblings', async function () {
    await render(hbs`
      <span class="x"></span>
      <span class="x"></span>
      <button></button>
      <span class="x"></span>
      <span class="x"></span>
      <span class="x"></span>
    `);

    expect(dom.siblings(find('button'))).to.deep.equal(findAll('.x'));
  });

  it('returns empty array if element has no siblings', async function () {
    await render(hbs`<button></button>`);

    expect(dom.siblings(find('button'))).to.deep.equal([]);
  });
});
