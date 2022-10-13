/**
 * It's a renderer component which renders needed editor elements according to
 * element specification (`editorElement`).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
   * @type {Array<AtmDataSpecFilter>}
   */
  dataSpecFilters: undefined,

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
   * @virtual
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
    'editorElementComponentNames',
    function editorElementComponentName() {
      const {
        editorElement,
        editorElementComponentNames,
      } = this.getProperties('editorElement', 'editorElementComponentNames');

      if (!editorElement || !(editorElement.type in editorElementComponentNames)) {
        return editorElementComponentNames.dataTypeSelector;
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
