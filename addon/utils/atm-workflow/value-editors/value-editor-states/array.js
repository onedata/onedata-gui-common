import ValueEditorState from './value-editor-state';

export default class ArrayValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = 'atm-workflow/value-editors/array/editor';

    /**
     * @type {Array<string>}
     */
    this.itemEditorStateIds = [];
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
    this.removeAllItemsWithoutNotification();
    this.notifyChange();
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
    return this.itemEditorStates.map((state) => state.value);
  }

  /**
   * @override
   */
  setValue(newValue) {
    this.removeAllItemsWithoutNotification();
    if (Array.isArray(newValue)) {
      this.itemEditorStateIds = newValue.map((itemValue) =>
        this.editorStateManager.createValueEditorState(this.itemDataSpec, itemValue)
      );
    }
  }

  /**
   * @override
   */
  getIsValid() {
    return this.itemEditorStates.every((state) => state.isValid);
  }

  /**
   * @private
   */
  removeAllItemsWithoutNotification() {
    this.itemEditorStateIds.forEach((editorStateId) =>
      this.editorStateManager.destroyValueEditorStateById(editorStateId)
    );
    this.itemEditorStateIds = [];
  }
}
