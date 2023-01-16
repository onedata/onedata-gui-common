import validate from 'onedata-gui-common/utils/atm-workflow/value-validators';
import ValueEditorState from './value-editor-state';

/**
 * @typedef {'visual'|'raw'} ArrayValueEditorStateMode
 */

export default class ArrayValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = 'atm-workflow/value-editors/array/editor';

    /**
     * @public
     * @type {ArrayValueEditorStateMode}
     */
    this.internalMode = this.internalMode ?? 'visual';

    /**
     * @private
     * @type {Array<string>}
     */
    this.itemEditorStateIds = this.itemEditorStateIds ?? [];

    /**
     * @private
     * @type {string}
     */
    this.internalStringifiedValue = this.internalStringifiedValue ?? '[]';
  }

  /**
   * @public
   * @returns {ArrayValueEditorStateMode}
   */
  get mode() {
    return this.internalMode;
  }

  /**
   * @private
   * @returns {AtmDataSpec | null}
   */
  get itemDataSpec() {
    return this.atmDataSpec?.valueConstraints?.itemDataSpec ?? null;
  }

  /**
   * @public
   * @returns {Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState}
   */
  get itemEditorStates() {
    return (this.itemEditorStateIds ?? []).map((editorStateId) =>
      this.editorStateManager.getValueEditorStateById(editorStateId)
    ).filter(Boolean);
  }

  /**
   * @public
   * @returns {string}
   */
  get stringifiedValue() {
    return this.internalStringifiedValue;
  }

  /**
   * @public
   * @param {string} newValue
   * @returns {string}
   */
  set stringifiedValue(newValue) {
    this.internalStringifiedValue = newValue;
    this.notifyChange();
  }

  /**
   * @public
   * @param {ArrayValueEditorStateMode} newMode
   * @returns {void}
   */
  changeMode(newMode) {
    if (this.internalMode === newMode) {
      return;
    }

    if (newMode === 'raw') {
      this.resetStringifiedValue();
    } else {
      this.recreateItemEditorsForValue(
        this.isValid ? JSON.parse(this.stringifiedValue) : []
      );
    }
    this.internalMode = newMode;
    this.notifyChange();
  }

  /**
   * @public
   * @returns {void}
   */
  addNewItem() {
    if (!this.itemDataSpec) {
      return;
    }

    const newItemEditorState = this.editorStateManager
      .createValueEditorState(this.itemDataSpec);
    this.itemEditorStateIds.push(newItemEditorState.id);
    this.notifyChange();
  }

  /**
   * @public
   * @param {string} itemEditorStateId
   */
  removeItem(itemEditorStateId) {
    const currentLength = this.itemEditorStateIds.length;
    this.itemEditorStateIds = this.itemEditorStateIds
      .filter((id) => id !== itemEditorStateId);
    if (this.itemEditorStateIds.length !== currentLength) {
      this.editorStateManager.destroyValueEditorStateById(itemEditorStateId);
    }
    this.notifyChange();
  }

  /**
   * @public
   * @returns {void}
   */
  clear() {
    if (this.mode === 'raw') {
      this.stringifiedValue = '[]';
    } else {
      this.removeAllItemsWithoutNotification();
      this.notifyChange();
    }
  }

  /**
   * @override
   */
  destroy() {
    super.destroy(...arguments);
    this.removeAllItemsWithoutNotification();
  }

  /**
   * @override
   */
  getValue() {
    if (this.mode === 'raw') {
      try {
        return JSON.parse(this.stringifiedValue);
      } catch (e) {
        return null;
      }
    } else {
      return this.itemEditorStates.map((state) => state.value);
    }
  }

  /**
   * @override
   */
  setValue(newValue) {
    if (this.mode === 'raw') {
      this.resetStringifiedValue();
    } else {
      this.recreateItemEditorsForValue(newValue);
    }
  }

  /**
   * @override
   */
  getIsValid() {
    if (this.mode === 'raw') {
      return (this.value === null && this.stringifiedValue.trim() === 'null') ||
        (this.value !== null && validate(this.value, this.atmDataSpec));
    } else {
      return this.itemEditorStates.every((state) => state.isValid);
    }
  }

  /**
   * @private
   */
  removeAllItemsWithoutNotification() {
    (this.itemEditorStateIds ?? []).forEach((editorStateId) =>
      this.editorStateManager.destroyValueEditorStateById(editorStateId)
    );
    this.itemEditorStateIds = [];
  }

  /**
   * @private
   */
  recreateItemEditorsForValue(value) {
    this.removeAllItemsWithoutNotification();
    if (Array.isArray(value)) {
      this.itemEditorStateIds = value.map((itemValue) =>
        this.editorStateManager.createValueEditorState(this.itemDataSpec, itemValue).id
      );
    }
  }

  /**
   * @private
   */
  resetStringifiedValue() {
    this.internalStringifiedValue = JSON.stringify(this.value, null, 2);
  }
}
