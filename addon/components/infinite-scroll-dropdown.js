import { action, computed } from '@ember/object';
import Component from '@glimmer/component';
import ChunkablePlainArray from 'onedata-gui-common/utils/chunkable-plain-array';
import { defaultMatcher } from 'ember-power-select/utils/group-utils';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '@ember/utils';

export default class InfiniteScrollDropdownComponent extends Component {
  /**
   * Set the height of the option element if it is other than standard styles.
   * It is needed only if using chunkable options.
   * @virtual optional
   * @type {number}
   */
  customOptionRowHeight;

  @tracked
  searchTerm = '';

  get allOptions() {
    return this.args.options;
  }

  // FIXME: test zmiany całego parametru options - czy wtedy się przeładuje lista?
  // FIXME: destroy
  // FIXME: można robić nową klasę, która będzie mieć zależność od args.options
  @computed('chunkablePlainArray.chunksArray')
  get chunksArray() {
    console.warn('recompute chunksArray');
    return this.chunkablePlainArray.chunksArray;
  }

  @computed('allOptions', 'searchTerm', 'matcher')
  get filteredOptions() {
    console.warn('recompute filteredOptions');
    if (this.searchTerm) {
      return this.allOptions.filter(option =>
        this.matcher(option, this.searchTerm) !== -1
      );
    } else {
      return this.allOptions;
    }

  }

  @computed()
  get chunkablePlainArray() {
    return new DropdownChunkablePlainArray(this);
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

  // FIXME: to nie może iść bezpośrednio - trzeba to obsłużyć ręcznie w implementacji
  get searchField() {
    return this.args.searchField ? `item.${this.args.searchField}` : 'item';
  }

  get triggerClass() {
    return `${this.args.triggerClass} infinite-scroll-dropdown-trigger`;
  }

  get dropdownClass() {
    return `${this.args.dropdownClass} infinite-scroll-dropdown`;
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

  matcher(option, searchTerm) {
    return (this.args.matcher ?? defaultMatcher)(option, searchTerm);
  }

  @action
  async search(searchTerm) {
    this.searchTerm = searchTerm;
    await this.chunkablePlainArray.chunksArray.scheduleReload({ head: true });
    return this.oneDropdownOptions;
  }

  // FIXME: test: custom onInput
  @action
  handleInput(term, publicAPI, event) {
    if (isBlank(term)) {
      this.search('');
    }
    return this.args.onInput?.(term, publicAPI, event);
  }

  @action
  handleClose(publicAPI, event) {
    const closeResult = this.args.onClose?.(publicAPI, event);
    if (closeResult === false) {
      return false;
    } else if (!isBlank(this.searchTerm)) {
      // let the original code execute first
      (async () => {
        this.search('');
      })();
    }
  }

  /** @override */
  willDestroy() {
    try {
      this.chunkablePlainArray?.destroy();
    } finally {
      super.willDestroy(...arguments);
    }
  }
}

class DropdownChunkablePlainArray extends ChunkablePlainArray {
  /** @type {InfiniteScrollDropdownComponent} */
  infiniteScrollDropdown;

  constructor(infiniteScrollDropdown) {
    super(null);
    this.infiniteScrollDropdown = infiniteScrollDropdown;
  }

  /** @override */
  @computed('infiniteScrollDropdown.filteredOptions')
  get sourceArray() {
    return this.infiniteScrollDropdown.filteredOptions;
  }
}
