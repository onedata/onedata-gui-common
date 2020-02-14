import { click } from 'ember-native-dom-helpers';
import $ from 'jquery';

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
    return $(this.triggerSelector)[0];
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
    return $(`${this.dropdownSelector} .ember-power-select-search-input`)[0];
  }

  /**
   * @param {number} n item index starting from 1
   * @returns {HTMLLIElement|null}
   */
  getNthOption(n) {
    return $(this.dropdownSelector + ` li:nth-child(${n})`)[0];
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
