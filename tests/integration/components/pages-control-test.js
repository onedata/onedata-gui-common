import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import _ from 'lodash';
import ArrayPaginator from 'onedata-gui-common/utils/array-paginator';

describe('Integration | Component | pages-control', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('paginator', ArrayPaginator.create({
      array: _.range(0, 128),
      pageSize: 10,
    }));
  });

  it('renders pages-control component', async function () {
    await renderComponent();
    expect(find('.pages-control')).to.exist;
  });

  it('shows validation success when input is correct number', async function () {
    await renderComponent();
    expect(find('.pages-control')).to.exist;
    await fillIn('input', '1');
    expect(find('.pages-control')).to.not.have.class('invalid-page-number');
  });

  it('shows validation failed when input is negative', async function () {
    await renderComponent();
    expect(find('.pages-control')).to.exist;
    await fillIn('input', '-1');
    expect(find('.pages-control')).to.have.class('invalid-page-number');
  });

  it('shows validation failed when input is zero', async function () {
    await renderComponent();
    expect(find('.pages-control')).to.exist;
    await fillIn('input', '0');
    expect(find('.pages-control')).to.have.class('invalid-page-number');
  });

  it('shows validation failed when input is float number', async function () {
    await renderComponent();
    expect(find('.pages-control')).to.exist;
    await fillIn('input', '1.5');
    expect(find('.pages-control')).to.have.class('invalid-page-number');
  });

  it('shows validation failed when input is larger than pages count', async function () {
    await renderComponent();
    expect(find('.pages-control')).to.exist;
    await fillIn('input', '14');
    expect(find('.pages-control')).to.have.class('invalid-page-number');
  });

  it('shows validation failed when input is "e"', async function () {
    await renderComponent();
    expect(find('.pages-control')).to.exist;
    await fillIn('input', 'e');
    expect(find('.pages-control')).to.have.class('invalid-page-number');
  });
});

async function renderComponent() {
  await render(hbs`
      <PagesControl
        @activePageNumber={{this.paginator.activePageNumber}}
        @pagesCount={{this.paginator.pagesCount}}
        @pageSize={{this.paginator.pageSize}}
        @onPageChange={{this.paginator.changeActivePageNumber}}
      />
    `);
}
