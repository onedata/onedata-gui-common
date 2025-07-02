import { expect } from 'chai';
import _ from 'lodash';
import { describe, it, afterEach } from 'mocha';
import ChunkablePlainArray, { IndexedItem } from 'onedata-gui-common/utils/chunkable-plain-array';
import { settled } from '@ember/test-helpers';

describe('Unit | Utility | chunkable-plain-array', function () {
  afterEach(function () {
    this.chunkable?.destroy();
  });

  it('exposes chosen fragment via ReplacingChunksArray with data source from sourceArray',
    async function () {
      const sourceArray = _.range(100).map(i => createItem(i));
      this.chunkable = new ChunkablePlainArray(sourceArray);

      const chunksArray = this.chunkable.chunksArray;
      await chunksArray.initialLoad;
      chunksArray.setIndices(20, 30);
      await settled();

      const actual = chunksArray.toArray();
      const expected = _.range(10, 40).map(i =>
        new IndexedItem(createItem(i), String(i))
      );
      expect(actual).to.deep.equal(expected);
    }
  );

  it('allows to jump to array index via ReplacingChunksArray', async function () {
    const sourceArray = _.range(100).map(i => createItem(i));
    this.chunkable = new ChunkablePlainArray(sourceArray, {
      initialJumpIndex: '80',
      minChunkSize: 20,
      indexMargin: 0,
    });

    const chunksArray = this.chunkable.chunksArray;
    await chunksArray.initialLoad;

    const actual = chunksArray.toArray();
    const expected = _.range(80, 100).map(i => new IndexedItem(createItem(i), String(i)));
    expect(actual).to.deep.equal(expected);
  });

  it('exposes new source plain array after source change',
    async function () {
      const sourceArray1 = _.range(100).map(i => createItem(i));
      const sourceArray2 = _.range(100, 200).map(i => createItem(i));
      this.chunkable = new ChunkablePlainArray(sourceArray1, { indexMargin: 0 });

      const chunksArray = this.chunkable.chunksArray;
      await chunksArray.initialLoad;
      chunksArray.setIndices(0, 10);
      await settled();
      const expected1 = _.range(0, 10).map(i =>
        new IndexedItem(createItem(i), String(i))
      );
      expect(chunksArray.toArray()).to.deep.equal(expected1);

      // change source array
      this.chunkable.sourceArray = sourceArray2;
      await settled();
      const expected2 = _.range(0, 10).map(i =>
        new IndexedItem(createItem(i + 100), String(i))
      );
      expect(chunksArray.toArray()).to.deep.equal(expected2);
    }
  );
});

function createItem(i) {
  return `${String(i).padStart(2, '0')}`;
}
