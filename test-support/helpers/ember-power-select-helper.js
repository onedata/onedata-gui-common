import { click } from 'ember-native-dom-helpers';

export default class EmberPowerSelectHelper {
  constructor(powerSelectTriggerParentSelector, powerSelectDropdownSelector) {
    this.triggerSelector =
      powerSelectTriggerParentSelector + ' .ember-basic-dropdown-trigger';
    this.dropdownSelector = powerSelectDropdownSelector ||
      powerSelectTriggerParentSelector + ' .ember-basic-dropdown-content';
  }

  /**
   * @returns {HTMLDIVElement}
   */
  getTrigger() {
    return document.querySelector(this.triggerSelector);
  }

  /**
   * @returns {Promise} resolves when power-select dropdown is opened
   */
  open() {
    return click(this.getTrigger());
  }

  /**
   * @returns {HTMLINPUTElement}
   */
  getSearchInput() {
    return document.querySelector(
      `${this.dropdownSelector} .ember-power-select-search-input`
    );
  }

  /**
   * @param {number} n item index starting from 1
   * @returns {HTMLLIElement|null}
   */
  getNthOption(n) {
    return document.querySelector(`${this.dropdownSelector} li:nth-child(${n})`);
  }

  /**
   * @param {number} index 
   * @param {function} callback 
   */
  selectOption(index, callback) {
    return this.open()
      .then(() => click(this.getNthOption(index)))
      .then(() => {
        if (callback) {
          callback.call(this);
        }
      });
  }
}
