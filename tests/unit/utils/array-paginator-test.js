import { expect } from 'chai';
import { describe, it } from 'mocha';
import ArrayPaginator from 'onedata-gui-common/utils/array-paginator';

describe('Unit | Utility | array-paginator', function () {
  it('counts valid pageCount', function () {
    const paginator = ArrayPaginator.create({
      array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      pageSize: 3,
    });

    expect(paginator.pagesCount).to.equal(4);
  });

  it('returns empty page array for active page number lesser than 1', function () {
    const paginator = ArrayPaginator.create({
      array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      pageSize: 3,
      activePageNumber: 0,
    });

    expect(paginator.activePageArray).to.deep.equal([]);
  });

  it('returns empty page array for invalid active page number', function () {
    const paginator = ArrayPaginator.create({
      array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      pageSize: 3,
      activePageNumber: 5,
    });

    expect(paginator.activePageArray).to.deep.equal([]);
  });

  it('returns valid page array for valid active page number', function () {
    const paginator = ArrayPaginator.create({
      array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      pageSize: 3,
      activePageNumber: 2,
    });

    expect(paginator.activePageArray).to.deep.equal([3, 4, 5]);
  });

  it('returns valid page array after active page number change using property set', function () {
    const paginator = ArrayPaginator.create({
      array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      pageSize: 3,
      activePageNumber: 2,
    });

    paginator.set('activePageNumber', 3);

    expect(paginator.activePageArray).to.deep.equal([6, 7, 8]);
  });

  it('returns valid page array after active page number change using method', function () {
    const paginator = ArrayPaginator.create({
      array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      pageSize: 3,
      activePageNumber: 2,
    });

    paginator.changeActivePageNumber(3);

    expect(paginator.activePageArray).to.deep.equal([6, 7, 8]);
  });
});
