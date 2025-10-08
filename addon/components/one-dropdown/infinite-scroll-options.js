/**
 * Options component to use with InfiniteScrollDropdown.
 *
 * Adds support for infinite scroll list, handles indexed options, limits height of items.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import Options from 'ember-power-select/components/power-select/options';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import template from 'onedata-gui-common/templates/components/one-dropdown/infinite-scroll-options';
import { layout } from '@ember-decorators/component';
import globals from 'onedata-gui-common/utils/globals';
import { htmlSafe } from '@ember/template';

@layout(template)
export default class InfiniteScrollOptionsComponent extends Options {
  @computed()
  get infiniteScroll() {
    return DropdownOptionsInfiniteScroll.create({ dropdownOptionsComponent: this });
  }

  @computed('singleRowHeight')
  get liStyle() {
    if (typeof this.singleRowHeight === 'number') {
      return htmlSafe(`max-height: ${this.singleRowHeight}px;`);
    } else {
      return undefined;
    }
  }

  @computed('extra.optionRowHeight')
  get singleRowHeight() {
    return this.extra?.optionRowHeight ?? 45;
  }

  /** @override */
  didInsertElement() {
    this._super(...arguments);
    const ul = globals.document.getElementById(
      'ember-power-select-options-' + this.select.uniqueId
    );
    this.infiniteScroll.mount(ul, ul);
  }

  /** @override */
  willDestroy() {
    try {
      this.cacheFor('infiniteScroll')?.destroy();
    } finally {
      super.willDestroy(...arguments);
    }
  }
}

class DropdownOptionsInfiniteScroll extends InfiniteScroll {
  /**
   * @virtual
   * @type {InfiniteScrollOptionsComponent}
   */
  dropdownOptionsComponent;

  /** @override */
  @reads('dropdownOptionsComponent.extra.chunksArray')
  entries;

  /** @override */
  @computed('dropdownOptionsComponent.singleRowHeight')
  get singleRowHeight() {
    return this.dropdownOptionsComponent.singleRowHeight;
  }

  /** @override */
  get itemIdProperty() {
    return 'index';
  }
}
