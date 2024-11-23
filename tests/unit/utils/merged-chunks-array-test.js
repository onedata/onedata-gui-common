import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import MergedChunksArray from 'onedata-gui-common/utils/merged-chunks-array';
import _ from 'lodash';
import { get } from '@ember/object';
import {
  MockArray,
  Record,
} from '../../helpers/replacing-chunks-array';

describe('Unit | Utility | merged-chunks-array', function () {
  // beforeEach(function () {
  //   this.mockArray = new MockArray();
  //   this.fetch = MockArray.prototype.fetch.bind(mockArray);
  // });

  afterEach(function () {
    this.array?.destroy();
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

  it('loads array beginning when using initialJumpIndex with index in the middle', async function () {
    const mockData = generateMockArrays();
    this.array = MergedChunksArray.create({
      fetchers: mockData.fetchers,
      initialJumpIndex: 15,
      chunkSize: 200,
    });

    await get(this.array, 'initialLoad');
    this.array.scheduleTask('fetchPrev');

    expect(this.array.sourceArray.toArray()).to.deep.equal(
      _.range(0, 65).map(i => new Record(i))
    );

    // expect(this.array.toArray(), this.array.toArray()).to.deep.equal(
    //   // array is loading 50 items by default with initialJumpIndex
    //   _.range(15, 65).map(i => new Record(i))
    // );
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
