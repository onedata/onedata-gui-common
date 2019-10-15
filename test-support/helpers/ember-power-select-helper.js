import { click, find } from 'ember-native-dom-helpers';

export default class EmberPowerSelectHelper {
  constructor(powerSelectTriggerParentSelector, powerSelectDropdownSelector) {
    this.triggerSelector =
      powerSelectTriggerParentSelector + ' .ember-basic-dropdown-trigger';
    this.dropdownSelector = powerSelectDropdownSelector ||
      powerSelectTriggerParentSelector + '.ember-power-select-options';
  }

  /**
   * @param {number} index 
   * @param {function} callback 
   */
  selectOption(index, callback) {
    return click(find(this.triggerSelector))
      .then(() => click(find(this.dropdownSelector+ ` li:nth-child(${index})`)))
      .then(() => {
        if (callback) {
          callback.call(this);
        }
      });
  }
}
