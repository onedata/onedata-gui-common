import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { dataSpecTypes, translateDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec';
import { createDataTypeElement } from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/create-data-spec-editor-element';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from '../../../templates/components/atm-workflow/data-spec-editor/data-type-selector';

export default Component.extend(I18n, {
  layout,

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.dataSpecEditor.dataTypeSelector',

  /**
   * @virtual
   * @type {(updatedElement: DataSpecEditorElement) => void}
   */
  onElementChange: undefined,

  /**
   * @type {ComputedProperty<{ value: string, label: SafeString }>}
   */
  selectorOptions: computed(function selectorOptions() {
    const i18n = this.get('i18n');
    return dataSpecTypes.map((dataSpecType) => ({
      value: dataSpecType,
      label: translateDataSpecType(i18n, dataSpecType),
    }));
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
    dataTypeSelected({ value: dataType }) {
      this.notifyElementChange(createDataTypeElement(dataType));
    },
  },
});
