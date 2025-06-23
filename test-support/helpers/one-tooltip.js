import { triggerEvent } from '@ember/test-helpers';
import globals from 'onedata-gui-common/utils/globals';

export default class OneTooltipHelper {
  /**
   * @param {HTMLElement|String} trigger element or selector
   */
  constructor(trigger) {
    this.trigger = trigger;
  }

  /**
   * @returns {Promise}
   */
  open() {
    return this.triggerEvent('mouseenter');
  }

  /**
   * @returns {Promise}
   */
  close() {
    return this.triggerEvent('mouseleave');
  }

  /**
   * @param {string} eventName
   * @returns {Promise<void>}
   */
  triggerEvent(eventName) {
    return triggerEvent(this.trigger, eventName);
  }

  /**
   * @returns {HTMLElement}
   */
  getTooltip() {
    return globals.document.querySelector('.tooltip.in');
  }

  /**
   * @returns {Promise<Boolean>}
   */
  hasTooltip() {
    return this.open()
      .then(() => Boolean(this.getTooltip()))
      .then(exists => this.close().then(() => exists));
  }

  /**
   * @returns {Promise<String>}
   */
  getText() {
    return this.open()
      .then(() => this.getTooltip().textContent.trim())
      .then(text => this.close().then(() => text));
  }
}
