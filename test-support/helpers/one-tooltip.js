import { triggerEvent } from 'ember-native-dom-helpers';

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
    return triggerEvent(this.trigger, 'mouseenter');
  }

  /**
   * @returns {Promise}
   */
  close() {
    return triggerEvent(this.trigger, 'mouseleave');
  }

  /**
   * @returns {HTMLElement}
   */
  getTooltip() {
    return document.querySelector('.tooltip.in');
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
