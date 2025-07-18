import Component from '@glimmer/component';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import ChunkablePlainArray from 'onedata-gui-common/utils/chunkable-plain-array';
import _ from 'lodash';
import { action } from '@ember/object';

export default class InfiniteScrollDemoComponent extends Component {
  constructor() {
    super(...arguments);

    this.chunkable = new ChunkablePlainArray(
      _.range(0, 1000).map(i => createItem(i))
    );

    /** @type {Utils.InfiniteScroll} */
    this.infiniteScroll = InfiniteScroll.create({
      entries: this.chunkable.chunksArray,
      itemIdProperty: 'index',
      singleRowHeight: 25,
    });
  }

  /** @override */
  willDestroy() {
    super.willDestroy(...arguments);
    this.chunkable.destroy();
  }

  @action
  didInsert(element) {
    this.infiniteScroll.mount(element.querySelector('ul.list'));
  }
}

function createItem(i) {
  return { name: `${String(i).padStart(3, '0')}` };
}
