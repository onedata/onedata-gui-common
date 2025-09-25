import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import Options from 'ember-power-select/components/power-select/options';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import template from 'onedata-gui-common/templates/components/one-dropdown/infinite-scroll-options';
import { layout } from '@ember-decorators/component';
import globals from 'onedata-gui-common/utils/globals';

@layout(template)
export default class InfiniteScrollOptionsComponent extends Options {
  @computed()
  get infiniteScroll() {
    return DropdownOptionsInfiniteScroll.create({ dropdownOptionsComponent: this });
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
  @computed('dropdownOptionsComponent.extra.optionRowHeight')
  get singleRowHeight() {
    return this.dropdownOptionsComponent.extra?.optionRowHeight ?? 45;
  }

  /** @override */
  get itemIdProperty() {
    return 'index';
  }
}
