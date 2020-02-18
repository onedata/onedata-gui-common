import { triggerEvent } from 'ember-native-dom-helpers';

export default class OneTooltipHelper {
  constructor(trigger) {
    this.trigger = trigger;
  }

  open() {
    return triggerEvent(this.trigger, 'mouseenter');
  }

  getTooltip() {
    return document.querySelector('.tooltip.in');
  }

  hasTooltip() {
    return this.open()
      .then(() => Boolean(this.getTooltip()));
  }

  getText() {
    return this.open().then(() => this.getTooltip().innerText)
  }
}
