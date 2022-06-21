import Component from '@ember/component';
import {
  createDataTypeSelectorElement,
  createDataTypeElement,
} from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/create-data-spec-editor-element';
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
      this.notifyElementChange(createDataTypeSelectorElement());
    },
    packIntoArray() {
      this.notifyElementChange(createDataTypeElement('array', {
        item: this.get('editorElement'),
      }));
    },
    unpackFromArray() {
      this.notifyElementChange(
        this.get('editorElement.config.item') || createDataTypeSelectorElement()
      );
    },
  },
});
