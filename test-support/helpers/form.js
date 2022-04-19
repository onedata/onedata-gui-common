import { click } from '@ember/test-helpers';

export default class FormHelper {
  constructor(template, componentSelector = '') {
    this.template = template;
    this.form = template.querySelector(componentSelector + ' form');
  }

  /**
   * @param {string} fieldName
   * @return {HTMLElement}
   */
  getInput(fieldName) {
    return this.form.querySelector('.field-' + fieldName);
  }

  /**
   * @param {string} fieldName
   * @return {HTMLElement}
   */
  getToggleInput(fieldName) {
    return this.form.querySelector('.toggle-field-' + fieldName);
  }

  submit() {
    return click(this.form.querySelector('button[type=submit]'));
  }
}
