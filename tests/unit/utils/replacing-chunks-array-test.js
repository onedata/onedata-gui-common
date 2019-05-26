import { expect } from 'chai';
import { describe, it } from 'mocha';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';
import _ from 'lodash';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

import { Promise, resolve } from 'rsvp';
import { get } from '@ember/object';

class Record {
  constructor(index) {
    this.index = index;
  }
}

function recordRange(start, end) {
  return _.range(start, end).map(i => new Record(i));
}

const testArray = recordRange(0, 1000);

function fetch(fromId = 0, size = Number.MAX_SAFE_INTEGER, offset = 0) {
  let startIndex = 0;
  for (let i = 0; i < testArray.length; ++i) {
    startIndex = i;
    if (testArray[i].index >= fromId) {
      break;
    }
  }
  const startOffset = Math.max(0, Math.min(startIndex + offset, testArray.length - size));
  return Promise.resolve(testArray.slice(startOffset, startOffset + size));
}

describe('Unit | Utility | replacing chunks array', function () {
  it('exposes fragment of internal array and fetches new chunks', function () {
    const fetchSpy = sinon.spy(fetch);
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 10,
    });
    return get(array, 'initialLoad').then(() => {
      expect(fetchSpy, 'initial fetch').to.be.calledOnce;
      expect(get(array, 'length'), 'length after init').to.equal(10);
      expect(array.toArray(), 'content after init: ' + array.mapBy('index'))
        .to.deep.equal(recordRange(0, 10));

      array.setProperties({
        startIndex: 7,
        endIndex: 17,
      });
      return wait().then(() => {
        expect(fetchSpy, 'fetch after index change').to.be.calledTwice;
        expect(get(array, 'length'), 'length after index change').to.equal(
          10);
        expect(array.toArray(), 'content after index change')
          .to.deep.equal(recordRange(7, 17));
      });
    });
  });

  it('reloads currently viewed fragment of array', function () {
    const fetchSpy = sinon.spy(fetch);
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 10,
    });
    return wait().then(() => {
      expect(fetchSpy, 'initial fetch').to.be.calledOnce;
      array.reload();
      return wait().then(() => {
        expect(fetchSpy, 'fetch after reload').to.be.calledTwice;
        expect(fetchSpy, 'fetch current records').to.be.calledWith(0, 10, 0);
        expect(array.toArray(), 'content after reload')
          .to.deep.equal(recordRange(0, 10));
      });
    });
  });

  it('immediately returns new firstObject if changing startIndex and endIndex',
    function () {
      const fullArray = _.times(1000, i => new Record(i));

      function getData(index, limit = 10000000, offset = 0) {
        let arrIndex = _.findIndex(fullArray, i => i.index === index);
        if (arrIndex === -1) {
          arrIndex = 0;
        }
        return resolve(fullArray.slice(arrIndex + offset, arrIndex + offset + limit));
      }

      const array = ReplacingChunksArray.create({
        fetch: getData,
        startIndex: 0,
        endIndex: 30,
      });
      return get(array, 'initialLoad').then(() => {
        expect(array.get('firstObject')).to.deep.equal({ index: 0 });

        array.setProperties({
          startIndex: 7,
          endIndex: 17,
        });
        return wait().then(() => {
          expect(array.toArray(), 'content after index change')
            .to.deep.equal(recordRange(7, 17));
          expect(array.objectAt(0), 'after: objectAt 0').to.deep.equal({ index: 7 });
          expect(array.get('firstObject'), 'after: firstObject').to.deep.equal({ index: 7 });
        });
      });
    }
  );

  it('has the same lastObject with toArray after fetch',
    function () {
      const fetchSpy = sinon.spy(fetch);
      const array = ReplacingChunksArray.create({
        fetch: fetchSpy,
        startIndex: 0,
        endIndex: 10,
      });
      return get(array, 'initialLoad').then(() => {
        expect(array.get('lastObject.index'), 'last object before')
          .to.equal(array.toArray().get('lastObject.index'));

        array.setProperties({
          startIndex: 7,
          endIndex: 17,
        });
        return wait().then(() => {
          expect(array.get('lastObject.index'), 'last object after')
            .to.equal(array.toArray().get('lastObject.index'));
        });
      });
    }
  );
});
