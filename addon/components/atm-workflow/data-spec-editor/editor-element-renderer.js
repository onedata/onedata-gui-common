import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../../../templates/components/atm-workflow/data-spec-editor/editor-element-renderer';

const editorElementComponentsPath = 'atm-workflow/data-spec-editor';

const editorElementComponentNames = Object.freeze({
  dataTypeSelector: `${editorElementComponentsPath}/data-type-selector`,
  dataType: {
    default: `${editorElementComponentsPath}/default-data-type-editor`,
    array: `${editorElementComponentsPath}/array-data-type-editor`,
  },
});

export default Component.extend({
  layout,
  tagName: '',

  /**
   * @virtual
   * @type {FormElementMode}
   */
  mode: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isEnabled: undefined,

  /**
   * @virtual
   * @type {DataSpecEditorElement}
   */
  editorElement: undefined,

  /**
   * @virtual
   * @type {DataSpecEditorElement|null}
   */
  parentEditorElement: undefined,

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
   * @virtual
   * @type {() => void}
   */
  onFocusLost: undefined,

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
