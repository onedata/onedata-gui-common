import { expect } from 'chai';
import {
  describe,
  it,
} from 'mocha';
import filterBySubstring from 'onedata-gui-common/utils/filter-by-substrings';

describe('Unit | Utility | filter-by-substrings', function () {
  it('filters using "name" property substring value by default', function () {
    const collection = [
      { name: 'zero' },
      { name: 'onetwothreefour' },
      { name: 'four five' },
      { name: 'fo ur 123' },
    ];

    const result = filterBySubstring(collection, 'four', (record) => [record.name]);

    expect(result).to.deep.equal([
      { name: 'onetwothreefour' }, { name: 'four five' },
    ]);
  });

  it('can filter using single property substring value evaluated in getStringsCallback', function () {
    const collection = [
      { description: 'zero' },
      { description: 'onetwothreefour' },
      { description: 'four five' },
      { description: 'fo ur 123' },
    ];

    const result = filterBySubstring(collection, 'four', (record) => [record.description]);

    expect(result).to.deep.equal([
      { description: 'onetwothreefour' }, { description: 'four five' },
    ]);
  });

  it('can filter using multiple properties evaluated in getStringsCallback', function () {
    const collection = [
      { description: 'zero', organizationName: 'four' },
      { description: 'five', organizationName: 'six' },
      { description: 'four', organizationName: 'seven' },
    ];

    const result = filterBySubstring(collection, 'four', (record) => [
      record.organizationName,
      record.description,
    ]);

    expect(result).to.deep.equal([
      { description: 'zero', organizationName: 'four' },
      { description: 'four', organizationName: 'seven' },
    ]);
  });

  it('filters case-insensitive substring', function () {
    const collection = [
      { description: 'Zero' },
      { description: 'zero' },
      { description: 'four' },
    ];

    const result = filterBySubstring(collection, 'zero', (record) => [record.description]);

    expect(result).to.deep.equal([
      { description: 'Zero' }, { description: 'zero' },
    ]);
  });
});
