/**
 * An array value editor component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import { computed } from '@ember/object';
import { bool } from '@ember/object/computed';
import { tag } from 'ember-awesome-macros';
import EditorBase from '../commons/editor-base';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/array/editor';

export default EditorBase.extend(I18n, {
  layout,

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.array.editor',

  /**
   * @type {ArrayValueEditorStateMode}
   */
  mode: 'visual',

  /**
   * @type {boolean}
   */
  isValid: true,

  /**
   * @type {ArrayValueEditorItemsVisibilityConfiguration|null}
   */
  itemsVisibilityConfiguration: null,

  /**
   * @type {Array<Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState>}
   */
  itemEditorStates: undefined,

  /**
   * @type {string}
   */
  stringifiedValue: '',

  /**
   * @type {boolean}
   */
  isClearConfirmationOpened: false,

  /**
   * @type {ComputedProperty<string>}
   */
  itemsCountText: computed('itemEditorStates.length', function itemsCountText() {
    const itemsCount = this.itemEditorStates?.length ?? 0;
    return this.t(`itemsCount.${itemsCount === 1 ? 'single' : 'multiple'}`, {
      itemsCount,
    });
  }),

  /**
   * @type {ComputedProperty<{
   *   visibleAtTop: Array<Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState>,
   *   hidden: Array<Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState>,
   *   visibleAtBottom: Array<Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState>,
   * }>}
   */
  sectionsOfItemEditorStates: computed(
    'itemEditorStates.[]',
    'itemsVisibilityConfiguration',
    function sectionsOfItemEditorStates() {
      if (!this.itemsVisibilityConfiguration || !this.itemEditorStates?.length) {
        return {
          visibleAtTop: [],
          hidden: [],
          visibleAtBottom: [],
        };
      }

      return {
        visibleAtTop: this.itemEditorStates?.slice(
          0,
          this.itemsVisibilityConfiguration.visibleAtTop
        ),
        hidden: this.itemEditorStates?.slice(
          this.itemsVisibilityConfiguration.visibleAtTop,
          -this.itemsVisibilityConfiguration.visibleAtBottom
        ),
        visibleAtBottom: this.itemsVisibilityConfiguration.visibleAtBottom ?
          this.itemEditorStates?.slice(
            -this.itemsVisibilityConfiguration.visibleAtBottom
          ) : [],
      };
    }
  ),

  /**
   * @type {ComputedProperty<SafeString|null>}
   */
  toggleModeDisabledTip: computed(
    'mode',
    'isValid',
    function toggleModeDisabledTip() {
      if (this.mode === 'raw' && !this.isValid) {
        return this.t('changeModeDisabledTip.invalidJson');
      }
      return null;
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isToggleModeDisabled: bool('toggleModeDisabledTip'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isThereSomethingToClear: computed(
    'mode',
    'itemEditorStates',
    'stringifiedValue',
    function shouldClearBeConfirmed() {
      switch (this.mode) {
        case 'visual':
          return this.itemEditorStates.length > 0;
        case 'raw':
          return this.stringifiedValue.trim() !== '[]';
        default:
          return false;
      }
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  clearTriggerId: tag `clear-trigger-${'editorState.id'}`,

  /**
   * @override
   */
  handleStateChange() {
    this._super(...arguments);
    if (!this.editorState) {
      return;
    }

    this.setProperties({
      itemEditorStates: this.editorState.itemEditorStates,
      itemsVisibilityConfiguration: this.editorState.itemsVisibilityConfiguration,
      stringifiedValue: this.editorState.stringifiedValue,
      mode: this.editorState.mode,
      isValid: this.editorState.isValid,
    });
  },

  /**
   * @param {Array<string>} referenceIds
   * @returns {boolean}
   */
  areItemEditorStatesIdsDifferent(referenceIds) {
    return !_.isEqual(
      (this.itemEditorStates ?? []).map((state) => state.id),
      referenceIds
    );
  },

  actions: {
    toggleMode() {
      if (this.isToggleModeDisabled) {
        return;
      }
      this.editorState.changeMode(this.mode === 'visual' ? 'raw' : 'visual');
    },
    showClearConfirmation() {
      if (this.isDisabled) {
        return;
      }
      if (this.shouldClearBeConfirmed) {
        this.set('isClearConfirmationOpened', true);
      } else {
        this.editorState.clear();
      }
    },
    confirmClear() {
      this.set('isClearConfirmationOpened', false);
      if (this.isDisabled) {
        return;
      }
      this.editorState.clear();
    },
    toggleClearConfirmation(state) {
      if ((!this.isThereSomethingToClear || this.isDisabled) && state) {
        return;
      }
      this.set('isClearConfirmationOpened', state);
    },
    showNextItems() {
      this.editorState?.showNextItems();
    },
    showAllItems() {
      this.editorState?.showAllItems();
    },
    itemCreated(newItemEditorStates) {
      this.editorState.addNewItems(newItemEditorStates);
    },
    removeItem(editorStateId) {
      this.editorState.removeItem(editorStateId);
    },
    rawValueChanged(newValue) {
      this.editorState.stringifiedValue = newValue;
    },
  },
});
