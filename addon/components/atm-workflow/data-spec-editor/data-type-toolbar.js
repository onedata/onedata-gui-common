import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  createDataTypeSelectorElement,
  createDataTypeElement,
} from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/create-data-spec-editor-element';
import dataSpecMatchesFilters from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/data-spec-matches-filters';
import { formValuesToDataSpec } from 'onedata-gui-common/utils/atm-workflow/data-spec-editor';
import valueConstraintsEditors from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/value-constraints-editors';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from '../../../templates/components/atm-workflow/data-spec-editor/data-type-toolbar';

export default Component.extend(I18n, {
  layout,
  classNames: ['data-type-toolbar'],
  classNameBindings: ['isEnabled::disabled'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.dataSpecEditor.dataTypeToolbar',

  /**
   * @virtual
   * @type {boolean}
   */
  isEnabled: undefined,

  /**
   * @virtual
   * @type {DataSpecEditorPlacementContext}
   */
  placementContext: undefined,

  /**
   * @virtual
   * @type {Array<DataSpecEditorFilter>}
   */
  dataTypeFilters: undefined,

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
  canUnpackFromArray: computed(
    'editorElement.config.dataType',
    'dataTypeFilters',
    'placementContext',
    function canUnpackFromArray() {
      const {
        dataTypeFilters,
        placementContext,
      } = this.getProperties('dataTypeFilters', 'placementContext');

      if (this.get('editorElement.config.dataType') !== 'array') {
        return false;
      }

      const itemDataSpec = formValuesToDataSpec(this.get('editorElement.config.item'));
      return dataSpecMatchesFilters(itemDataSpec, dataTypeFilters, placementContext);
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  canPackIntoArray: computed(
    'dataTypeFilters',
    'placementContext',
    function canPackIntoArray() {
      const {
        dataTypeFilters,
        placementContext,
      } = this.getProperties('dataTypeFilters', 'placementContext');

      const packedDataSpec = {
        type: 'array',
        valueConstraints: {
          itemDataSpec: formValuesToDataSpec(this.get('editorElement')),
        },
      };
      return dataSpecMatchesFilters(
        packedDataSpec,
        dataTypeFilters,
        placementContext,
      );
    }
  ),

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
      if (!this.get('isEnabled')) {
        return;
      }

      this.notifyElementChange(createDataTypeSelectorElement());
    },
    toggleRemoveWarn(newState) {
      const calculatedState = newState !== undefined ?
        Boolean(newState) : !this.get('isRemoveWarnOpened');

      if (!this.get('isEnabled') && calculatedState) {
        return;
      }

      this.set('isRemoveWarnOpened', calculatedState);
    },
    packIntoArray() {
      if (!this.get('isEnabled')) {
        return;
      }

      this.notifyElementChange(createDataTypeElement('array', {
        item: this.get('editorElement'),
      }));
    },
    unpackFromArray() {
      if (!this.get('isEnabled')) {
        return;
      }

      this.notifyElementChange(
        this.get('editorElement.config.item') || createDataTypeSelectorElement()
      );
    },
  },
});
