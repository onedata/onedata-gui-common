import Component from '@ember/component';
import _ from 'lodash';
import { computed } from '@ember/object';

export default class OneDropdownDemo extends Component {
  tagName = '';

  value = undefined;

  /**
   * OneDropdown small value
   * @type {String}
   */
  valueSmall = undefined;

  valueWithGroups = undefined;

  valueWithGroupsSmall = undefined;

  areGroupsCollapsible = false;

  /**
   * OneDropdown pseudo-text
   * @type {String}
   */
  valueSmallText = 'very long text very';

  @computed
  get optionsWithGroups() {
    return ['hello', 'world', 'foo', 'bar'].map(groupName => {
      return {
        groupName,
        options: _.range(0, 5).map(i => `${groupName}-${i}`),
      };
    });
  }

  @computed()
  get manyOptions() {
    return _.range(0, 1000);
  }
}
