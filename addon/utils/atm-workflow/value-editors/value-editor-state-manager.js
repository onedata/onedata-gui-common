import _ from 'lodash';
import valueEditorStates from './value-editor-states';

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
   */
  constructor(atmDataSpec) {
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

    const rootValueEditorState = this.createValueEditorState(this.atmDataSpec);

    /**
     * @public
     * @type {string}
     */
    this.rootValueEditorStateId = rootValueEditorState?.id;

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
   * @returns {void}
   */
  destroy() {
    this.stateChangeListeners = [];
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
   * @param {string} editorId
   * @returns {Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState | null}
   */
  getValueEditorStateById(editorId) {
    return this.editorStatesMap.get(editorId) ?? null;
  }

  /**
   * @public
   * @param {AtmDataSpec} atmDataSpec
   * @returns {Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState}
   */
  createValueEditorState(atmDataSpec) {
    const ValueEditorStateClass = valueEditorStates[atmDataSpec.type];
    if (!ValueEditorStateClass) {
      return null;
    }
    const valueEditorState = new ValueEditorStateClass(atmDataSpec);
    valueEditorState.addChangeListener(this.nestedValueEditorStateChangeListener);
    this.editorStatesMap.set(valueEditorState.id, valueEditorState);
    return valueEditorState;
  }

  /**
   * @public
   * @param {Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState} valueEditorState
   * @returns {void}
   */
  destroyValueEditorState(valueEditorState) {
    this.editorStatesMap.delete(valueEditorState.id);
    valueEditorState.destroy();
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
