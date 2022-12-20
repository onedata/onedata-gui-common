import { expect } from 'chai';
import {
  describe,
  it,
} from 'mocha';
import filterSpaces from 'onedata-gui-common/utils/filter-spaces';

describe('Unit | Utility | filter-spaces', function () {
  const plainProperties = [
    'name',
    'description',
    'organizationName',
  ];
  for (const property of plainProperties) {
    const createRecord = (value) => ({
      // default values
      name: '_name_',
      description: '_description_',
      organizationName: '_organization_name_',
      // override tested property
      ...{
        [property]: value,
      },
    });
    it(`filters out records by ${property} property value that contains search value`, function () {
      const collection = [
        createRecord('zero'),
        createRecord('onetwothreefour'),
        createRecord('four five'),
        createRecord('fo ur 123'),
      ];

      const result = filterSpaces(collection, 'four');

      expect(result).to.deep.equal([
        createRecord('onetwothreefour'),
        createRecord('four five'),
      ]);
    });
  }

  it('ignores trailing and leading spaces when filtering by property', function () {
    const collection = [
      { name: 'other' },
      { name: '   onetwothreefour   ' },
    ];

    const result = filterSpaces(collection, 'four');

    expect(result).to.deep.equal([
      { name: '   onetwothreefour   ' },
    ]);
  });

  it('filters out records with tags that contains search value words',
    function () {
      const collection = [
        { name: '1', tags: ['hello'] },
        { name: '2', tags: ['world'] },
        { name: '3', tags: ['hello', 'world'] },
        { name: '4', tags: ['first', 'hello', 'world', 'other'] },
        { name: '5', tags: ['last', 'other'] },
      ];

      const result = filterSpaces(collection, 'hello world', {
        arrayProperties: ['tags'],
      });

      expect(result).to.deep.equal([
        { name: '1', tags: ['hello'] },
        { name: '2', tags: ['world'] },
        { name: '3', tags: ['hello', 'world'] },
        { name: '4', tags: ['first', 'hello', 'world', 'other'] },
      ]);
    }
  );

  it('filters out records with matching name or tag', function () {
    const collection = [
      { name: 'one', tags: ['hello'] },
      { name: 'two', tags: ['world'] },
      { name: 'three', tags: ['hello', 'one'] },
      { name: 'four foo', tags: ['first', 'hello', 'world', 'other'] },
      { name: 'five', tags: ['foo'] },
    ];

    const result = filterSpaces(collection, 'one');

    expect(result).to.deep.equal([
      { name: 'one', tags: ['hello'] },
      { name: 'three', tags: ['hello', 'one'] },
    ]);
  });

  it('filters out records with matching part of tag', function () {
    const collection = [
      { name: 'one', tags: ['hello'] },
      { name: 'two', tags: ['world'] },
    ];

    const result = filterSpaces(collection, 'he');

    expect(result).to.deep.equal([
      { name: 'one', tags: ['hello'] },
    ]);
  });
});
