import { expect } from 'chai';
import _ from 'lodash';
import { describe, it, afterEach } from 'mocha';
import ChunkablePlainArray, { IndexedItem } from 'onedata-gui-common/utils/chunkable-plain-array';
import { settled } from '@ember/test-helpers';

describe('Unit | Utility | chunkable-plain-array', function () {
  afterEach(function () {
    this.chunkable?.destroy();
  });

  it(
    'exposes chosen fragment via ReplacingChunksArray with data source from sourceArray',
    async function () {
      const sourceArray = _.range(100).map(i => createItem(i));
      this.chunkable = new ChunkablePlainArray(sourceArray);

      const chunksArray = this.chunkable.chunksArray;
      await chunksArray.initialLoad;
      chunksArray.setIndices(20, 30);
      await settled();

      const actual = chunksArray.toArray();
      const expected = _.range(10, 40).map(i => new IndexedItem(createItem(i), i));
      expect(actual).to.deep.equal(expected);
    }
  );

  it('allows to jump to array index via ReplacingChunksArray', async function () {
    const sourceArray = _.range(100).map(i => createItem(i));
    this.chunkable = new ChunkablePlainArray(sourceArray, {
      initialJumpIndex: 80,
      minChunkSize: 20,
      indexMargin: 0,
    });

    const chunksArray = this.chunkable.chunksArray;
    await chunksArray.initialLoad;

    const actual = chunksArray.toArray();
    const expected = _.range(80, 100).map(i => new IndexedItem(createItem(i), i));
    expect(actual).to.deep.equal(expected);
  });
});

function createItem(i) {
  return `${String(i).padStart(2, '0')}`;
}
