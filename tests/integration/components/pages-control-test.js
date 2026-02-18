import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import _ from 'lodash';
import ArrayPaginator from 'onedata-gui-common/utils/array-paginator';
import { reads } from '@ember/object/computed';

describe('Integration | Component | pages-control', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('array', _.range(0, 128));
    this.set('pageSize', 10);
    this.set('paginator', ArrayPaginator.extend({
      array: reads('demoComponent.array'),
      pageSize: reads('demoComponent.pageSize'),
    }).create({
      demoComponent: this,
    }));
  });

  it('renders pages-control component', async function () {
    await render(hbs`
      <PagesControl
        @activePageNumber={{paginator.activePageNumber}}
        @pagesCount={{paginator.pagesCount}}
        @pageSize={{paginator.pageSize}}
        @onPageChange={{paginator.changeActivePageNumber}}
      />
    `);
    expect(find('.pages-control')).to.exist;
  });

  it('shows validation success when input is correct number', async function () {
    await render(hbs`
      <PagesControl
        @activePageNumber={{paginator.activePageNumber}}
        @pagesCount={{paginator.pagesCount}}
        @pageSize={{paginator.pageSize}}
        @onPageChange={{paginator.changeActivePageNumber}}
      />
    `);
    expect(find('.pages-control')).to.exist;
    await fillIn('input', '1');
    expect(find('.pages-control')).to.not.have.class('invalid-page-number');
  });

  it('shows validation failed when input is negative', async function () {
    await render(hbs`
      <PagesControl
        @activePageNumber={{paginator.activePageNumber}}
        @pagesCount={{paginator.pagesCount}}
        @pageSize={{paginator.pageSize}}
        @onPageChange={{paginator.changeActivePageNumber}}
      />
    `);
    expect(find('.pages-control')).to.exist;
    await fillIn('input', '-1');
    expect(find('.pages-control')).to.have.class('invalid-page-number');
  });

  it('shows validation failed when input is zero', async function () {
    await render(hbs`
      <PagesControl
        @activePageNumber={{paginator.activePageNumber}}
        @pagesCount={{paginator.pagesCount}}
        @pageSize={{paginator.pageSize}}
        @onPageChange={{paginator.changeActivePageNumber}}
      />
    `);
    expect(find('.pages-control')).to.exist;
    await fillIn('input', '0');
    expect(find('.pages-control')).to.have.class('invalid-page-number');
  });

  it('shows validation failed when input is float number', async function () {
    await render(hbs`
      <PagesControl
        @activePageNumber={{paginator.activePageNumber}}
        @pagesCount={{paginator.pagesCount}}
        @pageSize={{paginator.pageSize}}
        @onPageChange={{paginator.changeActivePageNumber}}
      />
    `);
    expect(find('.pages-control')).to.exist;
    await fillIn('input', '1.5');
    expect(find('.pages-control')).to.have.class('invalid-page-number');
  });

  it('shows validation failed when input is larger than pages count', async function () {
    await render(hbs`
      <PagesControl
        @activePageNumber={{paginator.activePageNumber}}
        @pagesCount={{paginator.pagesCount}}
        @pageSize={{paginator.pageSize}}
        @onPageChange={{paginator.changeActivePageNumber}}
      />
    `);
    expect(find('.pages-control')).to.exist;
    await fillIn('input', '14');
    expect(find('.pages-control')).to.have.class('invalid-page-number');
  });

  it('shows validation failed when input is "e"', async function () {
    await render(hbs`
      <PagesControl
        @activePageNumber={{paginator.activePageNumber}}
        @pagesCount={{paginator.pagesCount}}
        @pageSize={{paginator.pageSize}}
        @onPageChange={{paginator.changeActivePageNumber}}
      />
    `);
    expect(find('.pages-control')).to.exist;
    await fillIn('input', 'e');
    expect(find('.pages-control')).to.have.class('invalid-page-number');
  });

  it('fails enter string in change page input', async function () {
    await render(hbs`
      <PagesControl
        @activePageNumber={{paginator.activePageNumber}}
        @pagesCount={{paginator.pagesCount}}
        @pageSize={{paginator.pageSize}}
        @onPageChange={{paginator.changeActivePageNumber}}
      />
    `);
    expect(find('.pages-control')).to.exist;
    await fillIn('input', 'r');
    expect(find('.pages-control input')).to.have.value('');
    expect(find('.pages-control')).to.have.class('invalid-page-number');
  });
});
