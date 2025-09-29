import { computed } from '@ember/object';
import Component from '@glimmer/component';
import ChunkablePlainArray from 'onedata-gui-common/utils/chunkable-plain-array';

export default class InfiniteScrollDropdownComponent extends Component {
  /**
   * Set the height of the option element if it is other than standard styles.
   * It is needed only if using chunkable options.
   * @virtual optional
   * @type {number}
   */
  customOptionRowHeight;

  // FIXME: test zmiany options
  // FIXME: destroy
  // FIXME: można robić nową klasę, która będzie mieć zależność od args.options
  @computed('args.options')
  get chunksArray() {
    console.warn('recompute chunksArray');
    return new ChunkablePlainArray(this.args.options).chunksArray;
  }

  @computed('chunksArray.[]')
  get oneDropdownOptions() {
    return this.chunksArray.toArray();
  }

  @computed('chunksArray', 'optionRowHeight', 'args.extra')
  get oneDropdownExtra() {
    console.warn('recompute oneDropdownExtra');
    return {
      chunksArray: this.chunksArray,
      optionRowHeight: this.optionRowHeight,
      ...this.args.extra,
    };
  }

  get optionRowHeight() {
    console.warn('recompute optionRowHeight');
    return this.args.customOptionRowHeight ??
      (this.args.dropdownClass === 'small' ? 31 : 45);
  }

  /** @override */
  constructor() {
    super(...arguments);
    if (this.args.triggerComponent) {
      console.warn(
        'InfiniteScrollDropdown: settings custom triggerComponent is not supported'
      );
    }
    if (this.args.optionsComponent) {
      console.warn(
        'InfiniteScrollDropdown: settings custom optionsComponent is not supported'
      );
    }
  }

  /** @override */
  willDestroy() {
    try {
      this.chunksArray?.destroy();
    } finally {
      super.willDestroy(...arguments);
    }
  }
}
