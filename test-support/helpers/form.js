import { click } from 'ember-native-dom-helpers';

export default class FormHelper {
  constructor($template, componentSelector = '') {
    this.$template = $template;
    this.$form = $template.find(componentSelector + ' form');
  }

  /**
   * @param {string} fieldName
   * @returns {JQuery}
   */
  getInput(fieldName) {
    return this.$form.find('.field-' + fieldName);
  }

  /**
   * @param {string} fieldName
   * @returns {JQuery}
   */
  getToggleInput(fieldName) {
    return this.$form.find('.toggle-field-' + fieldName);
  }

  submit() {
    return click(this.$form.find('button[type=submit]')[0]);
  }
}
