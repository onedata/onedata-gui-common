import _ from 'lodash';
import { computed } from '@ember/object';
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
   * @type {Array<Utils.AtmWorkflow.ValueEditors.ValueEditorStates.ValueEditorState>}
   */
  itemEditorStates: undefined,

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
   * @override
   */
  handleStateChange() {
    if (!this.editorState) {
      return;
    }

    if (this.areItemEditorStatesIdsDifferent()) {
      this.set('itemEditorStates', this.editorState.itemEditorStates);
    }
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
    clear() {
      this.editorState.clear();
    },
    addNewItem() {
      this.editorState.addNewItem();
    },
    removeItem(editorStateId) {
      this.editorState.removeItem(editorStateId);
    },
  },
});
