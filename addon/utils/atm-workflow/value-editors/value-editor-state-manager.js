/**
 * State management utility class for automation value editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import valueEditorStateClasses from './value-editor-states';

/**
 * @typedef {Object} ValueEditorStateManagerDump
 * @property {unknown} value
 * @property {boolean} isValid
 */

/**
 * @typedef {(dump: ValueEditorStateManagerDump) => void} ValueEditorStateManagerChangeListener
 */

export default class ValueEditorStateManager {
  /**
   * @public
   * @param {AtmDataSpec} atmDataSpec
   * @param {AtmValueEditorContext} [editorContext]
   * @param {unknown} [initialValue]
   */
  constructor(atmDataSpec, editorContext = undefined, initialValue = undefined) {
    /**
     * @public
     * @readonly
     * @type {AtmValueEditorContext}
     */
    this.editorContext = editorContext ?? {};

    /**
     * @public
     * @readonly
     * @type {string|null}
     */
    this.rootValueEditorStateId = null;

    /**
     * @private
     * @type {AtmDataSpec}
     */
    this.atmDataSpec = atmDataSpec;

    /**
     * @private
     * @type {Map<string, Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState>}
     */
    this.editorStatesMap = new Map();

    /**
     * @private
     * @returns {void}
     */
    this.nestedValueEditorStateChangeListener = () => this.notifyChange();

    /**
     * @private
     * @type {Array<ValueEditorStateManagerChangeListener>}
     */
    this.changeListeners = [];

    /**
     * @private
     * @type {ValueEditorStateManagerDump}
     */
    this.lastDump = {
      value: null,
      isValid: false,
    };

    this.rootValueEditorStateId =
      this.createValueEditorState(this.atmDataSpec, initialValue)?.id ?? null;
  }

  /**
   * @public
   * @type {Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState | null}
   */
  get rootValueEditorState() {
    return this.editorStatesMap.get(this.rootValueEditorStateId) ?? null;
  }

  /**
   * @public
   * @type {boolean}
   */
  get isValid() {
    return this.rootValueEditorState?.isValid ?? false;
  }

  /**
   * @public
   * @type {unknown}
   */
  get value() {
    return this.rootValueEditorState?.value ?? null;
  }

  /**
   * @public
   * @param {unknown} value
   */
  set value(newValue) {
    if (this.rootValueEditorState) {
      this.rootValueEditorState.value = newValue;
    }
  }

  /**
   * @public
   * @returns {string}
   */
  get isDisabled() {
    return this.rootValueEditorState?.isDisabled ?? false;
  }

  /**
   * @public
   * @param {boolean} newValue
   */
  set isDisabled(newValue) {
    if (this.rootValueEditorState) {
      this.rootValueEditorState.isDisabled = newValue;
    }
  }

  /**
   * @public
   * @returns {void}
   */
  destroy() {
    this.changeListeners = [];
    [...this.editorStatesMap.values()].forEach((editorState) =>
      this.destroyValueEditorState(editorState)
    );
  }

  /**
   * @public
   * @param {ValueEditorStateManagerChangeListener} listener
   * @returns {void}
   */
  addChangeListener(listener) {
    if (!this.changeListeners.includes(listener)) {
      this.changeListeners.push(listener);
    }
  }

  /**
   * @public
   * @param {ValueEditorStateManagerChangeListener} listener
   * @returns {void}
   */
  removeChangeListener(listener) {
    this.changeListeners = this.changeListeners.filter((l) => l !== listener);
  }

  /**
   * @public
   * @param {string} editorId
   * @returns {Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState | null}
   */
  getValueEditorStateById(editorId) {
    return this.editorStatesMap.get(editorId) ?? null;
  }

  /**
   * @public
   * @param {AtmDataSpec} atmDataSpec
   * @param {unknown} initialValue
   * @returns {Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState}
   */
  createValueEditorState(atmDataSpec, initialValue = undefined) {
    const ValueEditorStateClass = valueEditorStateClasses[atmDataSpec.type];
    if (!ValueEditorStateClass) {
      return null;
    }
    const valueEditorState =
      new ValueEditorStateClass(this, atmDataSpec, this.editorContext, initialValue);
    valueEditorState.addChangeListener(this.nestedValueEditorStateChangeListener);
    this.editorStatesMap.set(valueEditorState.id, valueEditorState);
    return valueEditorState;
  }

  /**
   * @public
   * @param {string} valueEditorStateId
   * @returns {void}
   */
  destroyValueEditorStateById(valueEditorStateId) {
    const valueEditorState = this.getValueEditorStateById(valueEditorStateId);
    if (valueEditorState) {
      this.editorStatesMap.delete(valueEditorStateId);
      valueEditorState.destroy();
    }
  }

  /**
   * @private
   * @returns {void}
   */
  notifyChange() {
    const dump = {
      value: this.value,
      isValid: this.isValid,
    };

    if (!_.isEqual(dump, this.lastDump)) {
      this.lastDump = _.cloneDeep(dump);
      this.changeListeners.forEach((listener) => listener(dump));
    }
  }
}
