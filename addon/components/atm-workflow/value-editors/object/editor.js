import EditorBase from '../commons/editor-base';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/object/editor';

export default EditorBase.extend({
  layout,

  /**
   * @type {string}
   */
  editableValue: '',

  /**
   * @type {boolean}
   */
  isValid: true,

  /**
   * @override
   */
  handleStateChange() {
    if (!this.editorState) {
      return;
    }

    if (this.editableValue !== this.editorState.editableValue) {
      this.set('editableValue', this.editorState.editableValue);
    }
    if (this.isValid !== this.editorState.isValid) {
      this.set('isValid', this.editorState.isValid);
    }
  },

  /**
   * @returns {void}
   */
  propagateValueChange() {
    this.editorState.editableValue = this.editableValue;
  },

  actions: {
    valueChanged(newValue) {
      this.set('editableValue', newValue);
      this.propagateValueChange();
    },
  },
});
