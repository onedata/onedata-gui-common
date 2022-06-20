import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../../../templates/components/atm-workflow/data-spec-editor/editor-element-renderer';

const editorElementComponentsPath = 'atm-workflow/data-spec-editor';

const editorElementComponentNames = Object.freeze({
  dataTypeSelector: `${editorElementComponentsPath}/data-type-selector`,
  dataType: {
    default: `${editorElementComponentsPath}/data-type-specific`,
    array: `${editorElementComponentsPath}/data-type-array`,
  },
});

export default Component.extend({
  layout,
  tagName: '',

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
   * @type {Object}
   */
  editorElementComponentNames,

  /**
   * @type {ComputedProperty<string>}
   */
  editorElementComponentName: computed(
    'editorElement',
    function editorElementComponentName() {
      const {
        editorElement,
        editorElementComponentNames,
      } = this.getProperties('editorElement', 'editorElementComponentNames');

      if (!editorElement || !(editorElement.type in editorElementComponentNames)) {
        return;
      }

      if (editorElement.type === 'dataType') {
        return editorElementComponentNames.dataType[editorElement.config.dataType] ||
          editorElementComponentNames.dataType.default;
      } else {
        return editorElementComponentNames[editorElement.type];
      }
    }
  ),
});
