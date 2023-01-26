/**
 * Single value editor state.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import validate from 'onedata-gui-common/utils/atm-workflow/value-validators';
import generateId from 'onedata-gui-common/utils/generate-id';

/**
 * @typedef {(editorState: Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState) => void} ValueEditorStateChangeListener
 */

export default class ValueEditorState {
  /**
   * @public
   * @param {Utils.AtmWorkflow.ValueEditors.ValueEditorStateManager} editorStateManager
   * @param {AtmDataSpec} atmDataSpec
   * @param {AtmValueEditorContext | null} editorContext
   * @param {unknown} [initialValue]
   */
  constructor(editorStateManager, atmDataSpec, editorContext, initialValue = undefined) {
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
     * @type {AtmValueEditorContext | null}
     */
    this.editorContext = editorContext ?? null;

    /**
     * @public
     * @readonly
     * @type {string}
     */
    this.editorComponentName = '';

    /**
     * @private
     * @readonly
     * @type {Utils.AtmWorkflow.ValueEditors.ValueEditorStateManager}
     */
    this.editorStateManager = editorStateManager;

    /**
     * Value managed internally by this class. To get and set it, use
     * `value` getter/setter;
     * @private
     * @type {unknown}
     */
    this.internalValue = null;

    /**
     * @private
     * @type {boolean}
     */
    this.internalIsDisabled = false;

    /**
     * @private
     * @type {Array<ValueEditorStateChangeListener>}
     */
    this.changeListeners = [];

    if (initialValue !== undefined) {
      this.value = initialValue;
    }
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
   * @param {unknown} newValue
   */
  set value(newValue) {
    this.setValue(newValue);
    this.notifyChange();
  }

  /**
   * @public
   * @returns {string}
   */
  get isDisabled() {
    return this.internalIsDisabled;
  }

  /**
   * @public
   * @param {boolean} newValue
   */
  set isDisabled(newValue) {
    this.internalIsDisabled = Boolean(newValue);
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
