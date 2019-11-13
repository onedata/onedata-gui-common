import { click, find } from 'ember-native-dom-helpers';

export default class EmberPowerSelectHelper {
  constructor(powerSelectTriggerParentSelector, powerSelectDropdownSelector) {
    this.triggerSelector =
      powerSelectTriggerParentSelector + ' .ember-basic-dropdown-trigger';
    this.dropdownSelector = powerSelectDropdownSelector ||
      powerSelectTriggerParentSelector + ' .ember-power-select-options';
  }

  /**
   * @returns {Promise} resolves when power-select dropdown is opened
   */
  open() {
    return click(find(this.triggerSelector));
  }

  /**
   * @param {number} n item index starting from 1
   * @returns {HTMLLIElement|null}
   */
  getNthItem(n) {
    return find(this.dropdownSelector + ` li:nth-child(${n})`);
  }

  /**
   * @param {number} index 
   * @param {function} callback 
   */
  selectOption(index, callback) {
    return this.open()
      .then(() => click(this.getNthItem(index)))
      .then(() => {
        if (callback) {
          callback.call(this);
        }
      });
  }
}
