import { expect } from 'chai';
import { describe, it } from 'mocha';
import getIndexedListPosition from 'onedata-gui-common/utils/get-indexed-list-position';
import _ from 'lodash';

describe('Unit | Utility | get-indexed-list-position', function () {
  it('gets position of record with exact index', function () {
    // given
    const records = generateIndexedRecords(
      _.times(10).map(i => `hello-${String(i).padStart(2, '0')}`)
    );

    // when
    const result = getIndexedListPosition(records, 'hello-05');

    // then
    expect(result).to.equal(5);
  });

  it('gets out-of-bound position if index is out-of-band', function () {
    // given
    const records = generateIndexedRecords(
      _.times(10).map(i => `hello-${String(i).padStart(2, '0')}`)
    );

    // when
    const result = getIndexedListPosition(records, 'zeta');

    // then
    expect(result).to.equal(records.length);
  });

  it('gets next position if index is not found, but there is next record with larger index', function () {
    // given
    const records = generateIndexedRecords(
      _.times(10).map(i => `hello-${String(i).padStart(2, '0')}`)
    );

    // when
    const result = getIndexedListPosition(records, 'hello-05a');

    // then
    expect(result).to.equal(6);
  });
});

function generateIndexedRecords(indexes) {
  return indexes.map(index => ({ index }));
}
