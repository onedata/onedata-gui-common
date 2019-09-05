import { click, find } from 'ember-native-dom-helpers';

export default class EmberPowerSelectHelper {
  constructor(powerSelectSelector) {
    this.powerSelectSelector = powerSelectSelector;
  }

  /**
   * @param {number} index 
   * @param {function} callback 
   */
  selectOption(index, callback) {
    return click(find(this.powerSelectSelector + ' .ember-basic-dropdown-trigger'))
      .then(() => click(find(this.powerSelectSelector + ` li:nth-child(${index})`)))
      .then(() => {
        if (callback) {
          callback.call(this);
        }
      });
  }
}
