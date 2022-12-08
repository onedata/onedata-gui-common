import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
  afterEach,
} from 'mocha';
import filterObjects from 'onedata-gui-common/utils/filter-objects';
import sinon from 'sinon';
import { settled } from '@ember/test-helpers';

describe('Unit | Utility | filter-objects', function () {
  it('by default filters out records with names that contains search value', function () {
    const collection = [
      { name: 'zero' },
      { name: 'onetwothreefour' },
      { name: 'four five' },
      { name: 'fo ur 123' },
    ];

    const result = filterObjects(collection, 'four');

    expect(result).to.deep.equal([
      { name: 'onetwothreefour' }, { name: 'four five' },
    ]);
  });

  it('ignores trailing and leading spaces when filtering name', function () {
    const collection = [
      { name: 'other' },
      { name: '   onetwothreefour   ' },
    ];

    const result = filterObjects(collection, 'four');

    expect(result).to.deep.equal([
      { name: '   onetwothreefour   ' },
    ]);
  });

  it('by default filters out records with tags that contains search value words', function () {
    const collection = [
      { name: '1', tags: ['hello'] },
      { name: '2', tags: ['world'] },
      { name: '3', tags: ['hello', 'world'] },
      { name: '4', tags: ['first', 'hello', 'world', 'other'] },
      { name: '5', tags: ['last', 'other'] },
    ];

    const result = filterObjects(collection, 'hello world');

    expect(result).to.deep.equal([
      { name: '1', tags: ['hello'] },
      { name: '2', tags: ['world'] },
      { name: '3', tags: ['hello', 'world'] },
      { name: '4', tags: ['first', 'hello', 'world', 'other'] },
    ]);
  });

  it('by default filters out records with matching name or tag', function () {
    const collection = [
      { name: 'one', tags: ['hello'] },
      { name: 'two', tags: ['world'] },
      { name: 'three', tags: ['hello', 'one'] },
      { name: 'four foo', tags: ['first', 'hello', 'world', 'other'] },
      { name: 'five', tags: ['foo'] },
    ];

    const result = filterObjects(collection, 'one');

    expect(result).to.deep.equal([
      { name: 'one', tags: ['hello'] },
      { name: 'three', tags: ['hello', 'one'] },
    ]);
  });

  it('by default filters out records with matching part of tag', function () {
    const collection = [
      { name: 'one', tags: ['hello'] },
      { name: 'two', tags: ['world'] },
    ];

    const result = filterObjects(collection, 'he');

    expect(result).to.deep.equal([
      { name: 'one', tags: ['hello'] },
    ]);
  });

  it('filters out records using provided string properties', function () {
    const collection = [
      { name: 'hello', description: 'first record' },
      { name: 'one', description: 'hello' },
      { name: 'two', description: 'hello' },
      { name: 'world', description: 'last record' },
    ];

    const result = filterObjects(collection, 'hello', {
      stringProperties: ['name', 'description'],
    });

    expect(result).to.deep.equal([
      { name: 'hello', description: 'first record' },
      { name: 'one', description: 'hello' },
      { name: 'two', description: 'hello' },
    ]);
  });

  it('does not filter out records with matching tag when searchInTags is false', function () {
    const collection = [
      { name: 'hello', tags: ['world'] },
      { name: 'world', tags: ['hello'] },
    ];

    const result = filterObjects(collection, 'hello', {
      searchInTags: false,
    });

    expect(result).to.deep.equal([
      { name: 'hello', tags: ['world'] },
    ]);
  });
});
