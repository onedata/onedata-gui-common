import { click, find } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';

export default class EmberPowerSelectHelper {
  constructor(powerSelectSelector) {
    this.powerSelectSelector = powerSelectSelector;
  }

  /**
   * @param {number} index 
   * @param {function} callback 
   */
  selectOption(index, callback) {
    click(find(this.powerSelectSelector + ' .ember-basic-dropdown-trigger'));
    wait().then(() => {
      click(find(this.powerSelectSelector + ` li:nth-child(${index})`));
      wait().then(() => callback.call(this));
    });
  }
}
