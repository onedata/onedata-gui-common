import validate from 'onedata-gui-common/utils/atm-workflow/value-validators';
import ValueEditorState from './value-editor-state';

export default class StringValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = 'atm-workflow/value-editors/object/editor';
    if (!this.value) {
      this.value = null;
    }
  }

  /**
   * @public
   * @returns {string}
   */
  get editableValue() {
    return this.internalValue;
  }

  /**
   * @public
   * @param {string} newValue
   * @returns {string}
   */
  set editableValue(newValue) {
    this.internalValue = newValue;
    this.notifyChange();
  }

  /**
   * @override
   */
  getIsValid() {
    const value = this.value;
    return (value === null && this.editableValue.trim() === 'null') ||
      (value !== null && validate(this.value, this.atmDataSpec));
  }

  /**
   * @override
   */
  getValue() {
    try {
      return JSON.parse(this.internalValue);
    } catch (e) {
      return null;
    }
  }

  /**
   * @override
   */
  setValue(newValue) {
    this.internalValue = JSON.stringify(newValue, null, 2);
  }
}
