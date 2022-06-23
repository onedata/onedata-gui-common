import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  createDataTypeSelectorElement,
  createDataTypeElement,
} from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/create-data-spec-editor-element';
import valueConstraintsEditors from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/value-constraints-editors';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from '../../../templates/components/atm-workflow/data-spec-editor/data-type-toolbar';

export default Component.extend(I18n, {
  layout,
  classNames: ['data-type-toolbar'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.dataSpecEditor.dataTypeToolbar',

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
   * @type {boolean}
   */
  isRemoveWarnOpened: false,

  /**
   * @type {ComputedProperty<boolean>}
   */
  shouldWarnOnRemove: computed(
    'editorElement.config.{dataType,formValues.dataTypeEditor}',
    function shouldWarnOnRemove() {
      const dataType = this.get('editorElement.config.dataType');
      if (
        dataType === 'array' &&
        this.get('editorElement.config.item.type') === 'dataType'
      ) {
        return true;
      } else if (dataType in valueConstraintsEditors) {
        return valueConstraintsEditors[dataType].shouldWarnOnRemove(
          this.get('editorElement.config.formValues.dataTypeEditor')
        );
      } else {
        return false;
      }
    }
  ),

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
    toggleRemoveWarn(newState) {
      this.set(
        'isRemoveWarnOpened',
        newState !== undefined ?
        Boolean(newState) : !this.get('isRemoveWarnOpened')
      );
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
