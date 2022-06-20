import Component from '@ember/component';
import { computed } from '@ember/object';
import { translateDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec';
import layout from '../../../templates/components/atm-workflow/data-spec-editor/data-type-array';

export default Component.extend({
  layout,

  /**
   * @virtual
   * @type {DataSpecEditorElement}
   */
  editorElement: undefined,

  /**
   * @type {Map<string, DataSpecEditorElementContext>}
   */
  editorElementsContextMap: undefined,

  /**
   * @virtual
   * @type {(updatedElement: DataSpecEditorElement) => void}
   */
  onElementChange: undefined,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  dataTypeTranslation: computed(function dataTypeTranslation() {
    return translateDataSpecType(this.get('i18n'), 'array');
  }),

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
    itemElementChanged(itemElement) {
      this.notifyElementChange(Object.assign({}, this.get('editorElement'), {
        config: Object.assign({}, this.get('editorElement.config'), {
          item: itemElement,
        }),
      }));
    },
  },
});
