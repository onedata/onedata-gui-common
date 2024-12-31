import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

describe('Integration | Component | search-bar', function () {
  setupRenderingTest();

  it('invokes search on element insert, input change and destroy', async function () {
    const search = sinon.spy();
    this.set('search', search);
    this.set('isRendered', true);

    await render(hbs`
      {{#if this.isRendered}}
        <SearchBar @search={{this.search}} />
      {{/if}}
    `);

    const searchElement = find('.search-bar');
    expect(searchElement).to.exist;
    expect(search).to.have.been.calledOnceWith('');

    search.resetHistory();
    await fillIn(searchElement, 'hello');
    expect(search).to.have.been.calledOnceWith('hello');

    search.resetHistory();
    this.set('isRendered', false);
    expect(search).to.have.been.calledOnceWith('');
  });

  it('has default "Search..." placeholder', async function () {
    await render(hbs`
      <SearchBar />
    `);

    const searchElement = find('.search-bar');
    expect(searchElement.placeholder).to.equal('Search...');
  });

  it('has placeholder set using attribute', async function () {
    await render(hbs`
      <SearchBar placeholder="hello" />
    `);

    const searchElement = find('.search-bar');
    expect(searchElement.placeholder).to.equal('hello');
  });

  it('has classes passed using attribute concatenated with search-bar', async function () {
    await render(hbs`
      <SearchBar class="world" />
    `);

    const searchElement = find('input');
    expect(searchElement).to.have.class('world');
    expect(searchElement).to.have.class('search-bar');
  });
});
