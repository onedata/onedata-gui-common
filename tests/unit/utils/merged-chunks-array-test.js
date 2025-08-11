import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import MergedChunksArray from 'onedata-gui-common/utils/merged-chunks-array';
import _ from 'lodash';
import { computed, get } from '@ember/object';
import {
  MockArray,
  Record,
} from '../../helpers/replacing-chunks-array';
import { settled } from '@ember/test-helpers';
import sinon from 'sinon';

describe('Unit | Utility | merged-chunks-array', function () {
  afterEach(function () {
    this.array?.destroy();
  });

  it('fetchers can be overriden in subclasses using computed property getter', async function () {
    const mockFetchers = [];
    class ChildChunksArray extends MergedChunksArray {
      @computed()
      get fetchers() {
        return mockFetchers;
      }
    }
    this.array = ChildChunksArray.create();

    expect(this.array.fetchers).to.equal(mockFetchers);
  });

  it('fetchers can be overriden in EmberObject.create', async function () {
    const mockFetchers = [];
    this.array = MergedChunksArray.create({
      fetchers: mockFetchers,
    });

    expect(this.array.fetchers).to.equal(mockFetchers);
  });

  it('fetchers can be set multiple times in EmberObject', async function () {
    const mockFetchers1 = [];
    const mockFetchers2 = [];
    this.array = MergedChunksArray.create({
      fetchers: mockFetchers1,
    });
    this.array.set('fetchers', mockFetchers2);

    expect(this.array.fetchers).to.equal(mockFetchers2);
  });

  it('exposes fragment of array merged from multiple sources ', async function () {
    const chunkSize = 10;
    const initialStartIndex = 0;
    const initialEndIndex = 10;
    const mockData = generateMockArrays();
    this.array = MergedChunksArray.create({
      fetchers: mockData.fetchers,
      margin: 0,
      startIndex: initialStartIndex,
      endIndex: initialEndIndex,
      chunkSize,
    });

    await get(this.array, 'initialLoad');

    expect(this.array.toArray()).to.deep.equal(
      _.range(initialStartIndex, initialEndIndex).map(i => new Record(i))
    );
  });

  it('exposes fragment of array merged from multiple sources after range change', async function () {
    const chunkSize = 10;
    const initialStartIndex = 0;
    const initialEndIndex = 10;
    const mockData = generateMockArrays();
    this.array = MergedChunksArray.create({
      fetchers: mockData.fetchers,
      margin: 0,
      startIndex: initialStartIndex,
      endIndex: initialEndIndex,
      chunkSize,
    });

    await get(this.array, 'initialLoad');
    this.array.setProperties({
      startIndex: 5,
      endIndex: 15,
    });
    await settled();

    expect(this.array.toArray(), this.array.toArray()).to.deep.equal(
      _.range(5, 15).map(i => new Record(i))
    );
  });

  it('truncates result array at the end if endIndex exceedes merged data', async function () {
    const mockData = generateMockArrays();
    this.array = MergedChunksArray.create({
      fetchers: mockData.fetchers,
      margin: 0,
      startIndex: 0,
      endIndex: 10,
      chunkSize: 200,
    });

    await get(this.array, 'initialLoad');
    this.array.setProperties({
      startIndex: 95,
      endIndex: 105,
    });

    expect(this.array.toArray(), this.array.toArray()).to.deep.equal(
      _.range(95, 100).map(i => new Record(i))
    );
  });

  it('exposes array fragment from initialJumpIndex using merged data', async function () {
    const mockData = generateMockArrays();
    this.array = MergedChunksArray.create({
      fetchers: mockData.fetchers,
      initialJumpIndex: 15,
      chunkSize: 200,
    });

    await get(this.array, 'initialLoad');

    expect(this.array.toArray(), this.array.toArray()).to.deep.equal(
      // array is loading 50 items by default with initialJumpIndex
      _.range(15, 65).map(i => new Record(i))
    );
  });

  it('loads array beginning when moving slice to the beginning', async function () {
    const mockData = generateMockArrays();
    this.array = MergedChunksArray.create({
      fetchers: mockData.fetchers,
      chunkSize: 20,
    });

    // move right
    await this.array.initialLoad;
    this.array.setProperties({
      startIndex: 10,
      endIndex: 20,
    });

    // forget about first 10 entries
    this.array.scheduleReload();
    await settled();

    // load first 10 entries again
    await this.array.taskQueue.executionPromiseObject;
    this.array.setProperties({
      startIndex: 0,
      endIndex: 10,
    });
    await settled();
    await this.array.taskQueue.executionPromiseObject;

    expect(this.array.toArray()).to.deep.equal(
      _.range(0, 10).map(i => new Record(i))
    );
  });

  it('ignores single fetch error by default', async function () {
    const arrayLength = 10;
    const mockData = generateMockArrays(arrayLength);
    const fetchers = mockData.fetchers;
    fetchers[0] = sinon.stub().rejects();
    this.array = MergedChunksArray.create({
      fetchers: mockData.fetchers,
      chunkSize: arrayLength,
    });

    let isErrorThrown;
    try {
      await this.array.initialLoad;
    } catch (error) {
      isErrorThrown = true;
    }

    expect(isErrorThrown).to.be.undefined;
    expect(this.array.toArray(), this.array.toArray()).to.deep.equal(
      // 1/3 of items should not not fetched because of simulated error fetchers[0] error
      [1, 2, 4, 5, 7, 8].map(i => new Record(i))
    );
  });

  it('throws error if single fetch fails when ignoreFetcherErrors = false', async function () {
    const arrayLength = 10;
    const mockData = generateMockArrays(arrayLength);
    const fetchers = mockData.fetchers;
    fetchers[0] = sinon.stub().rejects();
    this.array = MergedChunksArray.create({
      ignoreFetcherErrors: false,
      fetchers: mockData.fetchers,
      chunkSize: arrayLength,
    });

    let isErrorThrown;
    try {
      await this.array.initialLoad;
    } catch (error) {
      isErrorThrown = true;
    }

    expect(isErrorThrown).to.be.ok;
  });
});

function generateMockArrays(totalLength = 100) {
  const mockArray1 = new MockArray(_.range(0, totalLength, 3).map(i => new Record(i)));
  const mockArray2 = new MockArray(_.range(1, totalLength, 3).map(i => new Record(i)));
  const mockArray3 = new MockArray(_.range(2, totalLength, 3).map(i => new Record(i)));
  const fetchers = [
    mockArray1.fetch.bind(mockArray1),
    mockArray2.fetch.bind(mockArray2),
    mockArray3.fetch.bind(mockArray3),
  ];
  return {
    mockArray1,
    mockArray2,
    mockArray3,
    fetchers,
  };
}
