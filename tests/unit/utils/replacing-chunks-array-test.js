import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import ReplacingChunksArray, { emptyItem } from 'onedata-gui-common/utils/replacing-chunks-array';
import _ from 'lodash';
import sinon from 'sinon';
import { settled } from '@ember/test-helpers';
import { Promise, resolve } from 'rsvp';
import { get } from '@ember/object';
import {
  defaultMockArraySize,
  MockArray,
  Record,
  recordRange,
  removeFromArray,
  addToArray,
  inspect,
} from '../../helpers/replacing-chunks-array';

class MockFullArray {
  constructor(size = 1000) {
    this.size = size;
    this.array = recordRange(0, size);
  }
  /**
   * For test purposes, this array ignores completely input params and always returns
   * all the array.
   * @returns {Promise<Array<Object>>}
   */
  fetch() {
    return Promise.resolve([...this.array]);
  }
}

class MockBrokenFetchArray extends MockArray {
  constructor(size, maxFetchCount = 1) {
    super(size);
    this.maxFetchCount = maxFetchCount;
  }
  /** @override */
  async fetch() {
    const { array: superArray, isLast: superIsLast } = await super.fetch(...arguments);
    return {
      // simulate incomplete list as can occur on backend
      array: superArray.slice(0, this.maxFetchCount),
      isLast: superIsLast,
    };
  }
}

const gteMatcher = (compareValue) => {
  return sinon.match(
    value => value >= compareValue,
    `greater or equal ${compareValue}`
  );
};

describe('Unit | Utility | replacing-chunks-array', function () {
  beforeEach(function () {
    this.mockArray = new MockArray();
    this.fetch = MockArray.prototype.fetch.bind(this.mockArray);
  });

  it('exposes fragment of internal array and fetches new chunks', async function () {
    const fetchSpy = sinon.spy(this.fetch);
    const chunkSize = 10;
    const initialEndIndex = 20;
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: initialEndIndex,
      chunkSize,
    });
    await get(array, 'initialLoad');

    // start is zero, so only fetchNext will be invoked
    expect(fetchSpy, 'initial fetch').to.be.calledTwice;
    expect(fetchSpy).to.be.calledWith(null, 20, 0);
    expect(fetchSpy).to.be.calledWith(19, chunkSize, 1);
    fetchSpy.resetHistory();
    expect(get(array, 'sourceArray.length'), 'source length after init')
      .to.equal(initialEndIndex + chunkSize);
    expect(get(array, 'length'), 'length after init').to.equal(initialEndIndex);
    expect(array.toArray(), 'content after init: ' + array.mapBy('index'))
      .to.deep.equal(recordRange(0, initialEndIndex));
    await settled();
    array.setProperties({
      startIndex: 15,
      endIndex: 25,
    });
    await settled();
    expect(fetchSpy, 'fetch after range change').to.be.calledOnce;
    expect(get(array, 'length'), 'length after range change').to.equal(10);
    expect(array.toArray(), 'content after range change')
      .to.deep.equal(recordRange(15, 25));
  });

  it('reloads currently viewed fragment of array at beginning', async function () {
    const fetchSpy = sinon.spy(this.fetch);
    const chunkSize = 24;
    const startIndex = 0;
    const endIndex = 10;
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex,
      endIndex,
      chunkSize,
    });
    await settled();
    fetchSpy.resetHistory();
    await array.scheduleReload();
    expect(fetchSpy, 'fetch after reload').to.be.calledOnce;
    expect(fetchSpy, 'fetch current records starts from null')
      .to.be.calledWith(null, chunkSize, 0);
    expect(array.toArray(), 'content after reload')
      .to.deep.equal(recordRange(startIndex, endIndex));
  });

  it('performs fetch as large as needed to load array content', async function () {
    const fetchSpy = sinon.spy(this.fetch);
    const chunkSize = 24;
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 20,
      indexMargin: 0,
      chunkSize,
    });
    await settled();
    expect(array.toArray(), 'content before load more')
      .to.deep.equal(recordRange(0, 20));
    fetchSpy.resetHistory();
    array.setProperties({
      startIndex: 15,
      endIndex: 45,
    });
    await settled();
    expect(fetchSpy, 'fetch records needed to fill start to end')
      .to.be.calledWith(gteMatcher(19), chunkSize, 1);
    expect(get(array, '_start')).to.equal(15);
    expect(get(array, '_end')).to.equal(45);
    expect(array.toArray(), 'content after reload')
      .to.deep.equal(recordRange(15, 45));
  });

  it('reloads array in the middle', async function () {
    const fetchSpy = sinon.spy(this.fetch);
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 100,
      chunkSize: 10,
    });
    await settled();
    fetchSpy.resetHistory();
    array.setProperties({
      startIndex: 30,
      endIndex: 40,
    });
    await array.scheduleReload();
    expect(fetchSpy).to.be.calledOnce;
    expect(fetchSpy).to.be.calledWith(30, 10, 0);
  });

  it('immediately returns new firstObject if changing startIndex and endIndex',
    async function () {
      const fullArray = _.times(1000, i => new Record(i));

      function getData(index, limit = 10000000, offset = 0) {
        let arrIndex = _.findIndex(fullArray, i => i.index === index);
        if (arrIndex === -1) {
          arrIndex = 0;
        }
        return resolve(
          fullArray.slice(arrIndex + offset, arrIndex + offset + limit)
        );
      }

      const array = ReplacingChunksArray.create({
        fetch: getData,
        startIndex: 0,
        endIndex: 30,
      });
      await get(array, 'initialLoad');
      expect(array.get('firstObject.index')).to.equal(0);
      array.setProperties({
        startIndex: 7,
        endIndex: 17,
      });
      await settled();
      expect(array.toArray(), 'content after index change')
        .to.deep.equal(recordRange(7, 17));
      expect(array.objectAt(0).index, 'after: objectAt 0')
        .to.equal(7);
      expect(array.get('firstObject.index'), 'after: firstObject')
        .to.equal(7);
    }
  );

  it('has the same lastObject with toArray after fetch',
    async function () {
      const fetchSpy = sinon.spy(this.fetch);
      const array = ReplacingChunksArray.create({
        fetch: fetchSpy,
        startIndex: 0,
        endIndex: 10,
      });
      await get(array, 'initialLoad');
      expect(array.get('lastObject.index'), 'last object before')
        .to.equal(array.toArray().get('lastObject.index'));

      array.setProperties({
        startIndex: 7,
        endIndex: 17,
      });
      await settled();
      expect(array.get('lastObject.index'), 'last object after')
        .to.equal(array.toArray().get('lastObject.index'));
    }
  );

  it('invokes fetch when going forth and back', async function () {
    const fetchSpy = sinon.spy(this.fetch);
    const chunkSize = 30;
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
      chunkSize,
    });
    await settled();
    expect(fetchSpy).to.have.been.calledWith(null, 60, 0);
    array.setProperties({
      startIndex: 20,
      endIndex: 60,
    });
    await settled();
    expect(fetchSpy).to.have.been.calledWith(
      59, // index of last element
      chunkSize,
      1
    );
    expect(array.toArray(), 'array content after index change to forth')
      .to.deep.equal(recordRange(10, 70));
    // reload causes 0..10 items to be emptied
    await array.scheduleReload();
    array.setProperties({
      startIndex: 0,
      endIndex: 50,
    });
    await settled();
    expect(
        array.toArray(),
        `array index change back: ${array.toArray().mapBy('index').join(', ')}`
      )
      .to.deep.equal(recordRange(0, 60));
  });

  it('invalidates previous items when reloading in the middle', async function () {
    const fetchSpy = sinon.spy(this.fetch);
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
      chunkSize: 10,
    });
    await settled();
    array.setProperties({
      startIndex: 10,
      endIndex: 60,
    });
    await settled();
    array.setProperties({
      startIndex: 20,
      endIndex: 70,
    });
    await settled();
    await array.scheduleReload();
    expect(get(array, 'emptyIndex'), 'emptyIndex forth').to.equal(9);
    expect(
      get(array, 'sourceArray').toArray().slice(0, 10),
      'invalidated items at beginning'
    ).to.deep.equal(_.times(10, _.constant(emptyItem)));
    expect(array.toArray(), 'proper content').to.deep.equal(
      recordRange(10, 80)
    );
    array.setProperties({
      startIndex: 0,
      endIndex: 50,
    });
    await settled();
    expect(get(array, 'emptyIndex'), 'emptyIndex back').to.equal(-1);
    expect(array.toArray()).to.deep.equal(recordRange(0, 60));
  });

  it('loads start part of the list after reload in the middle', async function () {
    const fetchSpy = sinon.spy(this.fetch);
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
    });
    await settled();
    array.setProperties({
      startIndex: 10,
      endIndex: 60,
    });
    await settled();
    array.setProperties({
      startIndex: 20,
      endIndex: 70,
    });
    await settled();
    this.mockArray.array = removeFromArray(this.mockArray.array, 70);
    array.scheduleReload();
    expect(array.toArray()).to.deep.equal(
      removeFromArray(recordRange(10, 80), 70)
    );
    await settled();
    array.setProperties({
      startIndex: 0,
      endIndex: 50,
    });
    await settled();
    expect(array.toArray()).to.deep.equal(recordRange(0, 60));
  });

  it('loads new data if range is set from 0 after new data is added', async function () {
    const fetchSpy = sinon.spy(this.fetch);
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
    });
    const frontRecord1 = new Record(-2);
    const frontRecord2 = new Record(-1);
    await settled();
    array.setProperties({
      startIndex: 10,
      endIndex: 60,
    });
    await settled();
    array.setProperties({
      startIndex: 20,
      endIndex: 70,
    });
    await settled();
    this.mockArray.array = addToArray(
      this.mockArray.array,
      0,
      frontRecord1,
      frontRecord2
    );
    await array.scheduleReload();
    array.setProperties({
      startIndex: 0,
      endIndex: 50,
    });
    await settled();
    const actualArray = array.toArray();
    const expectedArray = recordRange(0, 70);
    expect(actualArray).to.deep.equal(expectedArray);
    expect(get(array, '_start')).to.equal(2);
    expect(get(array, '_end')).to.equal(72);
    expect(get(array, 'sourceArray.0.index')).to.equal(-2);
    expect(get(array, 'sourceArray.1.index')).to.equal(-1);
  });

  it('notifies about fetchPrev start and resolve', async function () {
    const fetchPrevStartedHandler = sinon.spy();
    const fetchPrevResolvedHandler = sinon.spy();
    const fetchSpy = sinon.spy(this.fetch);

    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
    });
    array.on('fetchPrevStarted', fetchPrevStartedHandler);
    array.on('fetchPrevResolved', fetchPrevResolvedHandler);

    await settled();
    array.setProperties({
      startIndex: 10,
      endIndex: 60,
    });
    await settled();
    array.setProperties({
      startIndex: 20,
      endIndex: 70,
    });
    await settled();
    await array.scheduleReload();
    array.setProperties({
      startIndex: 0,
      endIndex: 50,
    });
    expect(fetchPrevStartedHandler).to.be.calledOnce;
    await settled();
    expect(fetchPrevResolvedHandler).to.be.calledOnce;
  });

  it('fills sourceArray with more data than expected if fetched more and uses it later',
    async function () {
      const arraySize = 1000;
      const mockFullArray = new MockFullArray(arraySize);
      const fetchFullArray = MockFullArray.prototype.fetch.bind(mockFullArray);
      const fetchSpy = sinon.spy(fetchFullArray);
      const array = ReplacingChunksArray.create({
        fetch: fetchSpy,
        startIndex: 0,
        endIndex: 20,
        indexMargin: 0,
      });
      await settled();
      expect(fetchSpy).to.be.calledOnce;
      expect(array.toArray(), 'first load contents')
        .to.deep.equal(recordRange(0, 20));
      expect(get(array, 'sourceArray')).to.have.lengthOf(arraySize);
      array.setProperties({
        startIndex: 20,
        endIndex: 60,
      });
      await settled();
      expect(fetchSpy).to.be.calledOnce;
      expect(array.toArray()).to.deep.equal(recordRange(20, 60));
      expect(get(array, 'sourceArray')).to.have.lengthOf(arraySize);
    }
  );

  it('injects self reference into fetch method',
    async function () {
      let compareArrayInstancesResult = undefined;
      let array;
      this.fetch = (a, b, c, arrayInstance) => {
        compareArrayInstancesResult = array === arrayInstance;
        return resolve([]);
      };
      array = ReplacingChunksArray.create({
        fetch: this.fetch,
        startIndex: 0,
        endIndex: 50,
        indexMargin: 10,
      });

      await array.scheduleReload();
      expect(compareArrayInstancesResult).to.equal(true);
    }
  );

  it('replaces array content by jumping to index forward without cache', async function () {
    const fetchSpy = sinon.spy(this.fetch);
    const indexMargin = 2;
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 20,
      indexMargin,
    });
    await settled();
    fetchSpy.resetHistory();
    await array.scheduleJump(60, 30);
    expect(fetchSpy).to.be.calledWith(60, 30 + indexMargin * 2, -indexMargin);
    expect(array.toArray(), 'content after jump').to.deep.equal(
      recordRange(60 - indexMargin, 60 + 30 + indexMargin),
    );
  });

  it('sets proper startIndex and endIndex when array is too small after jump', async function () {
    const fetchSpy = sinon.spy(this.fetch);
    const chunkSize = 10;
    // how many items will be fetched after jump will be used
    const expectedSize = 10;
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 20,
      chunkSize,
    });
    await settled();
    fetchSpy.resetHistory();
    await array.scheduleJump(defaultMockArraySize - expectedSize, 50);
    expect(get(array, 'startIndex'), 'start').to.equal(0);
    expect(get(array, 'endIndex'), 'end').to.equal(expectedSize);
  });

  it('modifies source array after jump to contain requested range', async function () {
    const fetchSpy = sinon.spy(this.fetch);
    const chunkSize = 10;
    const jumpStart = 60;
    const jumpAreaSize = 30;
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 10,
      indexMargin: 0,
      chunkSize,
    });
    await settled();
    fetchSpy.resetHistory();
    await array.scheduleJump(jumpStart, jumpAreaSize);
    expect(fetchSpy, 'jump fetch call').to.be.calledWith(jumpStart, jumpAreaSize);
    const source = array.get('sourceArray').toArray();
    expect(source, `source after jump ${inspect(array)}`)
      .to.deep.equal(
        recordRange(jumpStart, jumpStart + jumpAreaSize)
      );
  });

  it('handles object-format output from fetch when going forth', async function () {
    const baseFetch = this.mockArray.fetch.bind(this.mockArray);
    this.mockArray.fetch = async function fetchWithObject() {
      const { array } = await baseFetch(...arguments);
      return {
        array,
        isLast: this.forceIsLast,
      };
    };
    this.fetch = this.mockArray.fetch.bind(this.mockArray);
    const fetchSpy = sinon.spy(this.fetch);

    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 50,
      indexMargin: 0,
      chunkSize: 30,
    });
    await settled();
    expect(fetchSpy).to.have.been.calledWith(null, 50, 0);
    fetchSpy.resetHistory();
    expect(get(array, 'sourceArray').toArray())
      .to.deep.equal(recordRange(0, 50 + 30));

    array.setProperties({
      startIndex: 20,
      endIndex: 70,
    });
    await settled();
    expect(fetchSpy).to.have.been.called;
    fetchSpy.resetHistory();
    expect(get(array, 'sourceArray').toArray())
      .to.deep.equal(recordRange(0, 50 + 30 * 2));

    // next fetch should get isLast flag
    this.mockArray.forceIsLast = true;

    array.setProperties({
      startIndex: 45,
      endIndex: 95,
    });
    await settled();
    // last call that should return "isLast: true" flag
    expect(fetchSpy).to.have.been.called;
    fetchSpy.resetHistory();
    expect(get(array, 'sourceArray').toArray())
      .to.deep.equal(recordRange(0, 50 + 30 * 3));

    array.setProperties({
      endIndex: 150,
    });
    await settled();
    expect(fetchSpy).to.have.not.been.called;
    expect(get(array, 'sourceArray').toArray())
      .to.deep.equal(recordRange(0, 50 + 30 * 3));
  });

  it('performs multiple fetches if single fetch resolves less items than requested', async function () {
    const brokenChunkSize = 10;
    this.mockArray = new MockBrokenFetchArray(100, brokenChunkSize);
    this.fetch = this.mockArray.fetch.bind(this.mockArray);

    const fetchSpy = sinon.spy(this.fetch);
    const chunkSize = 40;
    const array = ReplacingChunksArray.create({
      fetch: fetchSpy,
      startIndex: 0,
      endIndex: 20,
      indexMargin: 0,
      chunkSize,
    });
    await settled();

    // expected call count because of initial fetch
    const minCallCount = 4;
    expect(fetchSpy.callCount).to.be.greaterThanOrEqual(minCallCount);
    expect(fetchSpy.firstCall).to.be.calledWith(null, chunkSize, 0);
    let lastChunkEndIndex;
    for (let i = 1; i <= minCallCount; ++i) {
      lastChunkEndIndex = get(array, 'sourceArray')[brokenChunkSize * i - 1].index;
      expect(fetchSpy.getCall(i)).to.be.calledWith(lastChunkEndIndex, chunkSize, 1);
    }
    expect(get(array, '_start')).to.equal(0);
    expect(get(array, '_end')).to.equal(20);
    expect(array.toArray()).to.deep.equal(recordRange(0, 20));
  });
});
