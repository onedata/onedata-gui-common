/**
 * Group component for `<OneDropdown>` (or `<EmberPowerSelect>`) that renders groups as a
 * collapses. Clicking the group name opens it. When search input is non-empty in the
 * dropdown, all groups are opened and cannot be collapsed until the search is cleared.
 *
 * It can be set in the `<OneDropdown>` using the `groupComponent` property.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import PowerSelectGroup from 'ember-power-select/components/power-select/power-select-group';
import { computed } from '@ember/object';
import { bool, reads } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import layout from 'onedata-gui-common/templates/components/one-dropdown/collapsible-group';

export default class OneDropdownCollapsibleGroup extends PowerSelectGroup {
  tagName = 'li';
  layout = layout;
  classNames = [
    'ember-power-select-group',
    'one-dropdown-group',
    'one-dropdown-group-collapsible',
  ];
  classNameBindings = ['collapseClass', 'allGroupsOpened:all-groups-opened'];
  attributeBindings = ['ariaDisabled', 'role'];

  role = 'option';

  clickHandler = this.handleClick.bind(this);

  @tracked isCollapsed = true;

  @computed('group.disabled')
  get ariaDisabled() {
    if (this.group.disabled) {
      return 'true';
    }
    return undefined;
  }

  @bool('select.searchText') isSearchActive;

  @reads('isSearchActive') allGroupsOpened;

  @computed('isCollapsed', 'allGroupsOpened')
  get collapseClass() {
    return (!this.isCollapsed || this.allGroupsOpened) ? 'group-opened' : '';
  }

  init() {
    super.init(...arguments);
    if (this.group.options.includes(this.select.selected)) {
      this.set('isCollapsed', false);
    }
  }

  /** @override */
  didInsertElement() {
    super.didInsertElement(...arguments);
    this.element.addEventListener('click', this.clickHandler);
  }

  /** @override */
  willDestroyElement() {
    try {
      this.element.removeEventListener('click', this.clickHandler);
    } finally {
      super.willDestroyElement(...arguments);
    }
  }

  handleClick() {
    if (!this.isSearchActive) {
      this.toggleProperty('isCollapsed');
    }
  }
}
