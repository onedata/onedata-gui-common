/**
 * Array value editor state.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import validate from 'onedata-gui-common/utils/atm-workflow/value-validators';
import ValueEditorState from './value-editor-state';
import { editorComponentsPrefix, getArrayItemCreatorComponentName } from '../commons';

/**
 * @typedef {'visual'|'raw'} ArrayValueEditorStateMode
 */

/**
 * @typedef {Object} ArrayValueEditorItemsVisibilityConfiguration
 * @property {number} visibleAtTop
 * @property {number} visibleAtBottom
 * @property {number} changeVisibilityStep
 */

const minItemsVisibleAtTopCount = 4;
const minItemsVisibleAtBottomCount = 1;
const itemsVisibilityChangeStep = 10;

export default class ArrayValueEditorState extends ValueEditorState {
  /**
   * @override
   */
  constructor() {
    super(...arguments);
    this.editorComponentName = `${editorComponentsPrefix}/array/editor`;
    if (!this.value) {
      this.value = [];
    }

    // Using assignmenets with `??` below as already done operations in this
    // constructor might have changed `this.value` which automatically changes
    // values of the fields below. We don't want to override these changes.

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

    /**
     * @private
     * @type {number}
     */
    this.itemsExpandedByUserCount = 0;
  }

  /**
   * @public
   * @returns {ArrayValueEditorStateMode}
   */
  get mode() {
    return this.internalMode;
  }

  /**
   * @public
   * @returns {AtmDataSpec | null}
   */
  get itemAtmDataSpec() {
    return this.atmDataSpec?.valueConstraints?.itemDataSpec ?? null;
  }

  /**
   * @public
   * @returns {string}
   */
  get itemCreatorComponentName() {
    return getArrayItemCreatorComponentName(this.itemAtmDataSpec);
  }

  /**
   * @public
   * @returns {Array<Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState>}
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
   * @type {ArrayValueEditorItemsVisibilityConfiguration}
   */
  get itemsVisibilityConfiguration() {
    let itemsCount = this.itemEditorStateIds.length;
    let visibleAtTop = Math.min(
      minItemsVisibleAtTopCount + this.itemsExpandedByUserCount,
      itemsCount,
    );
    itemsCount -= visibleAtTop;
    const visibleAtBottom = Math.min(minItemsVisibleAtBottomCount, itemsCount);
    itemsCount -= visibleAtBottom;
    if (itemsCount < itemsVisibilityChangeStep) {
      visibleAtTop += itemsCount;
      itemsCount = 0;
    }
    const changeVisibilityStep = itemsCount < 2 * itemsVisibilityChangeStep ?
      itemsCount : itemsVisibilityChangeStep;
    return {
      visibleAtTop,
      visibleAtBottom,
      changeVisibilityStep,
    };
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
   * @param {Array<Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState>} newItemEditorStates
   * @returns {void}
   */
  addNewItems(newItemEditorStates) {
    newItemEditorStates.forEach((state) => this.itemEditorStateIds.push(state.id));
    this.recalculateItemsExpandedByUserCount();
    this.notifyChange();
  }

  /**
   * @public
   * @param {string} itemEditorStateId
   * @returns {void}
   */
  removeItem(itemEditorStateId) {
    const currentLength = this.itemEditorStateIds.length;
    this.itemEditorStateIds = this.itemEditorStateIds
      .filter((id) => id !== itemEditorStateId);
    if (this.itemEditorStateIds.length !== currentLength) {
      this.editorStateManager.destroyValueEditorStateById(itemEditorStateId);
      this.recalculateItemsExpandedByUserCount();
      this.notifyChange();
    }
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
   * @public
   * @returns {void}
   */
  showAllItems() {
    if (this.itemsVisibilityConfiguration.changeVisibilityStep <= 0) {
      return;
    }
    this.itemsExpandedByUserCount = Math.max(
      this.itemEditorStateIds.length - minItemsVisibleAtTopCount -
      minItemsVisibleAtBottomCount,
      0
    );
    this.notifyChange();
  }

  /**
   * @public
   * @returns {void}
   */
  showNextItems() {
    const changeVisibilityStep =
      this.itemsVisibilityConfiguration.changeVisibilityStep;
    if (changeVisibilityStep <= 0) {
      return;
    }

    this.itemsExpandedByUserCount += changeVisibilityStep;
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
      return validate(this.value, this.atmDataSpec);
    } else {
      return this.itemEditorStates.every((state) => state.isValid);
    }
  }

  /**
   * @private
   * @returns {void}
   */
  removeAllItemsWithoutNotification() {
    (this.itemEditorStateIds ?? []).forEach((editorStateId) =>
      this.editorStateManager.destroyValueEditorStateById(editorStateId)
    );
    this.itemEditorStateIds = [];
    this.recalculateItemsExpandedByUserCount();
  }

  /**
   * @private
   * @returns {void}
   */
  recreateItemEditorsForValue(value) {
    this.removeAllItemsWithoutNotification();
    if (Array.isArray(value)) {
      this.itemEditorStateIds = value.map((itemValue) =>
        this.editorStateManager.createValueEditorState(this.itemAtmDataSpec, itemValue).id
      );
    }
    this.recalculateItemsExpandedByUserCount();
  }

  /**
   * @private
   * @returns {void}
   */
  resetStringifiedValue() {
    this.internalStringifiedValue = JSON.stringify(this.value, null, 2);
  }

  /**
   * @private
   * @returns {void}
   */
  recalculateItemsExpandedByUserCount() {
    const collapsibleItemsCount = this.itemEditorStateIds.length -
      minItemsVisibleAtTopCount - minItemsVisibleAtBottomCount;
    if (collapsibleItemsCount < itemsVisibilityChangeStep) {
      // There should be no user-triggered expansion as there are too few
      // items to have such.
      this.itemsExpandedByUserCount = 0;
    } else {
      this.itemsExpandedByUserCount = Math.min(
        this.itemsExpandedByUserCount,
        collapsibleItemsCount
      );
    }
  }
}
