import validate from 'onedata-gui-common/utils/atm-workflow/value-validators';
import generateId from 'onedata-gui-common/utils/generate-id';

/**
 * @typedef {(editorState: Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState) => void} ValueEditorStateChangeListener
 */

export default class ValueEditorState {
  /**
   * @public
   * @param {AtmDataSpec} atmDataSpec
   */
  constructor(atmDataSpec) {
    /**
     * @public
     * @readonly
     * @type {string}
     */
    this.id = generateId();

    /**
     * @public
     * @readonly
     * @type {AtmDataSpec}
     */
    this.atmDataSpec = atmDataSpec;

    /**
     * @public
     * @readonly
     * @type {string}
     */
    this.editorComponentName = '';

    /**
     * Value managed internally by this class. To get and set it, use
     * `value` getter/setter;
     * @private
     * @type {unknown}
     */
    this.internalValue = null;

    /**
     * @private
     * @type {Array<ValueEditorStateChangeListener>}
     */
    this.changeListeners = [];
  }

  /**
   * @public
   * @type {boolean}
   */
  get isValid() {
    return this.getIsValid();
  }

  /**
   * @public
   * @type {unknown}
   */
  get value() {
    return this.getValue();
  }

  /**
   * @public
   * @param {unknown} value
   */
  set value(newValue) {
    this.setValue(newValue);
    this.notifyChange();
  }

  /**
   * @public
   * @returns {void}
   */
  destroy() {
    this.stateChangeListeners = [];
  }

  /**
   * @public
   * @param {ValueEditorStateChangeListener} listener
   * @returns {void}
   */
  addChangeListener(listener) {
    if (!this.changeListeners.includes(listener)) {
      this.changeListeners.push(listener);
    }
  }

  /**
   * @public
   * @param {ValueEditorStateChangeListener} listener
   * @returns {void}
   */
  removeChangeListener(listener) {
    this.changeListeners = this.changeListeners.filter((l) => l !== listener);
  }

  /**
   * @private
   * @returns {void}
   */
  notifyChange() {
    this.changeListeners.forEach((listener) => listener(this));
  }

  /**
   * @private
   * @returns {boolean}
   */
  getIsValid() {
    return validate(this.value, this.atmDataSpec);
  }

  /**
   * @private
   * @returns {unknown}
   */
  getValue() {
    return this.internalValue;
  }

  /**
   * @private
   * @param {unknown} newValue
   * @returns {void}
   */
  setValue(newValue) {
    this.internalValue = newValue;
  }
}
