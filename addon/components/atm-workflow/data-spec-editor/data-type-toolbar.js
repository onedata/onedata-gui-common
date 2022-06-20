import Component from '@ember/component';
import generateId from 'onedata-gui-common/utils/generate-id';
import layout from '../../../templates/components/atm-workflow/data-spec-editor/data-type-toolbar';

export default Component.extend({
  layout,

  /**
   * @virtual
   * @type {DataSpecEditorElement}
   */
  editorElement: undefined,

  /**
   * @virtual
   * @type {(updatedElement: DataSpecEditorElement) => void}
   */
  onElementChange: undefined,

  /**
   * @param {DataSpecEditorElement} updatedElement
   * @returns {void}
   */
  notifyElementChange(updatedElement) {
    const onElementChange = this.get('onElementChange');

    if (onElementChange) {
      onElementChange(updatedElement);
    }
  },

  actions: {
    remove() {
      this.notifyElementChange({
        id: generateId(),
        type: 'dataTypeSelector',
      });
    },
  },
});
