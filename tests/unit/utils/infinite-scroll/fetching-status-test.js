import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import InfiniteScrollFetchingStatus from 'onedata-gui-common/utils/infinite-scroll/fetching-status';
import { get } from '@ember/object';
import { createMockReplacingChunksArray } from '../../../helpers/replacing-chunks-array';
import { settled } from '@ember/test-helpers';

describe('Unit | Utility | infinite-scroll/fetching-status', function () {
  afterEach(function () {
    this.entries?.destroy();
  });

  it('sets isFetchingNext when fetch next started and not resolved yet', async function () {
    this.entries = createMockReplacingChunksArray({
      startIndex: 0,
      endIndex: 10,
      chunkSize: 10,
    });
    const fetchingStatus = InfiniteScrollFetchingStatus.create({
      entries: this.entries,
    });
    await settled();
    expect(get(fetchingStatus, 'isFetchingNext')).to.be.false;

    this.entries.setProperties({
      startIndex: 10,
      endIndex: 20,
    });
    expect(get(fetchingStatus, 'isFetchingNext')).to.be.true;
  });

  it('disables events watching after using unbindLoadingStateNotifications', async function () {
    this.entries = createMockReplacingChunksArray({
      startIndex: 0,
      endIndex: 10,
      chunkSize: 10,
    });
    const fetchingStatus = InfiniteScrollFetchingStatus.create({
      entries: this.entries,
    });
    await settled();
    expect(get(fetchingStatus, 'isFetchingNext')).to.be.false;
    fetchingStatus.unbindLoadingStateNotifications();

    this.entries.setProperties({
      startIndex: 10,
      endIndex: 20,
    });
    expect(get(fetchingStatus, 'isFetchingNext')).to.be.false;
  });
});
