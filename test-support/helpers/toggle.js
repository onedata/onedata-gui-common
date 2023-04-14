export default class ToggleHelper {
  /**
   * @param {HTMLElement} toggleElement `one-way-toggle` element.
   */
  constructor(toggleElement) {
    /** @type {HTMLElement} */
    this.element = toggleElement;
  }

  isDisabled() {
    return this.element.matches('.disabled');
  }

  isChecked() {
    return this.element.matches('.checked');
  }
}
