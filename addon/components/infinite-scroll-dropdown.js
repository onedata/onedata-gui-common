/**
 * Dropdown that renders infinite-scrollable list from options provided with static array.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { action, computed, get } from '@ember/object';
import Component from '@glimmer/component';
import ChunkablePlainArray from 'onedata-gui-common/utils/chunkable-plain-array';
import { defaultMatcher } from 'ember-power-select/utils/group-utils';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '@ember/utils';

/** @import { IndexedItem } from '../utils/chunkable-plain-array.js' */

/**
 * @typedef {Object} InfiniteScrollDropdownSignature
 * @property {InfiniteScrollDropdownArgs} Args
 */

/**
 * If not described, most of these properties are passed directly to OneDropdown
 * component. See API reference of ember-power-select for details.
 * @typedef {Object} InfiniteScrollDropdownArgs
 * @property {string} afterOptionsComponent
 * @property {boolean} animationEnabled
 * @property {string} ariaDescribedBy
 * @property {string} ariaInvalid
 * @property {string} ariaLabel
 * @property {string} ariaLabelledBy
 * @property {string} beforeOptionsComponent
 * @property {Function} buildSelection
 * @property {Function} calculatePosition
 * @property {boolean} closeOnSelect
 * @property {any|Function} defaultHighlighted
 * @property {string} destination
 * @property {boolean} disabled
 * @property {string} dropdownClass
 * @property {string} eventType
 * @property {object} extra
 * @property {string} groupComponent Not recommended to use, because
 *   InfiniteScrollDropdown does not support groups. If any group will be passed to the
 *   options, the dropdown will be malfunctioning.
 * @property {boolean} highlightOnHover
 * @property {string} horizontalPosition
 * @property {boolean} initiallyOpened
 * @property {string} loadingMessage
 * @property {boolean} matchTriggerWidth
 * @property {Function} matcher
 * @property {string} noMatchesMessage
 * @property {string} noMatchesMessageComponent
 * @property {Function} onBlur
 * @property {Function} onChange
 * @property {Function} onClose
 * @property {Function} onFocus
 * @property {Function} onInput
 * @property {Function} onKeydown
 * @property {Function} onOpen
 * @property {Array<any>} options
 * @property {string} optionsComponent Not recommended to use, because
 *   InfiniteScrollDropdown uses its own options component handling indexed entries,
 *   created for the chunks array.
 * @property {string} placeholder
 * @property {string} placeholderComponent
 * @property {boolean} preventScroll
 * @property {Function} registerAPI
 * @property {boolean} renderInPlace
 * @property {boolean} required
 * @property {Function} scrollTo Not recommended to use - not tested with infinite scroll.
 * @property {Function} search Not supported - may be implemented in future versions or in
 *   derivied class.
 * @property {boolean} searchEnabled
 * @property {string} searchField
 * @property {string} searchMessage
 * @property {string} searchPlaceholder
 * @property {any} selected The InfiniteScrollDropdown component does not support array of
 *   selected items.
 * @property {string} selectedItemComponent
 * @property {string} tabindex
 * @property {string} triggerClass
 * @property {string} triggerComponent Not recommended to use, because
 *   InfiniteScrollDropdown uses its own trigger component handling indexed entries,
 *   created for the chunks array.
 * @property {string} triggerId
 * @property {string} triggerRole
 * @property {Function} typeAheadMatcher Not recommended to use - not tested.
 * @property {string} verticalPosition
 */

/**
 * @extends {Component<InfiniteScrollDropdownSignature>}
 */
export default class InfiniteScrollDropdownComponent extends Component {
  /**
   * Set the height of the option element if it is other than standard styles.
   * It is needed only if using chunkable options.
   * @virtual optional
   * @type {number}
   */
  customOptionRowHeight;

  /**
   * Cache of last `selected` getter result to be able to show last selected item when
   * using search that filters indexed array. If the selected item is gone from that
   * array, the selected getter would return null.
   * @type {IndexedItem}
   */
  #lastIndexedSelected;

  @tracked
  searchTerm = '';

  @computed('args.options.content')
  get allOptions() {
    if (this.args.options?.then && !this.args.options.promise) {
      throw new Error(
        'InfiniteScrollDropdown: promise options are not supported - use PromiseObject instead'
      );
    }
    return this.args.options?.content ?? this.args.options ?? [];
  }

  @computed('chunkablePlainArray.chunksArray')
  get chunksArray() {
    // FIXME: usunąć logowanie recompute na końcu
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

  @computed('args.{customOptionRowHeight,dropdownClass}')
  get optionRowHeight() {
    console.warn('recompute optionRowHeight');
    return this.args.customOptionRowHeight ??
      (this.args.dropdownClass?.split(/\s+/).includes('small') ? 31 : 45);
  }

  get triggerClass() {
    let resultClass = 'infinite-scroll-dropdown-trigger';
    if (this.args.triggerClass) {
      resultClass += ` ${this.args.triggerClass}`;
    }
    return resultClass;
  }

  get dropdownClass() {
    let resultClass = 'infinite-scroll-dropdown';
    if (this.args.dropdownClass) {
      resultClass += ` ${this.args.dropdownClass}`;
    }
    return resultClass;
  }

  get selected() {
    console.warn('recompute InfiniteScrollDropdown.selected');
    const selectedItem = this.args.selected;
    if (
      this.searchTerm &&
      this.#lastIndexedSelected &&
      selectedItem === this.#lastIndexedSelected.item
    ) {
      return this.#lastIndexedSelected;
    }

    const indexedSelected = this.chunkablePlainArray.indexedArray.find(indexedItem =>
      indexedItem.item === selectedItem
    );
    this.#lastIndexedSelected = indexedSelected;
    return indexedSelected;
  }

  constructor() {
    super(...arguments);
    if (this.args.search) {
      throw new Error('InfiniteScrollDropdown: custom @search is not supported');
    }
  }

  matcher(option, searchTerm) {
    if (this.args.matcher) {
      return this.args.matcher(option, searchTerm);
    } else {
      const value = this.args.searchField ? get(option, this.args.searchField) : option;
      return defaultMatcher(value, searchTerm);
    }
  }

  @action
  async search(searchTerm) {
    this.searchTerm = searchTerm;
    await this.chunkablePlainArray.chunksArray.scheduleReload({ head: true });
    return this.oneDropdownOptions;
  }

  @action
  handleInput(term, publicAPI, event) {
    const onInputResult = this.args.onInput?.(term, publicAPI, event);
    if (onInputResult === false) {
      return false;
    } else if (isBlank(term)) {
      // let the original code execute first
      (async () => {
        this.search('');
      })();
    }
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

  @action
  handleChange(selected, publicAPI, event) {
    return this.args.onChange?.(selected.item, publicAPI, event);
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
