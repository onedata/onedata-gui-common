import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  dataSpecTypes,
  dataSpecSupertypes,
  dataSpecSubtypes,
  translateDataSpecType,
} from 'onedata-gui-common/utils/atm-workflow/data-spec';
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
   * @type {Array<DataSpecEditorFilter>}
   */
  dataTypeFilters: undefined,

  /**
   * @virtual
   * @type {DataSpecEditorElement|null}
   */
  parentEditorElement: undefined,

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
   * @type {ComputedProperty<DataSpecEditorPlacementContext>}
   */
  placementContext: computed('parentEditorElement', function placementContext() {
    const parentDataType = this.get('parentEditorElement.config.dataType');
    if (!parentDataType) {
      return 'root';
    } else if (parentDataType === 'array') {
      return 'array';
    } else {
      return 'default';
    }
  }),

  /**
   * @type {ComputedProperty<{ value: string, label: SafeString }>}
   */
  selectorOptions: computed(
    'dataTypeFilters',
    'placementContext',
    function selectorOptions() {
      const {
        i18n,
        dataTypeFilters,
        placementContext,
      } = this.getProperties('i18n', 'dataTypeFilters', 'placementContext');

      const allowedDataSpecTypes = [];
      for (const dataSpecType of dataSpecTypes) {
        let typeRejected = false;
        for (const dataTypeFilter of (dataTypeFilters || [])) {
          switch (dataTypeFilter.filterType) {
            case 'typeOrSupertype':
              if (dataTypeFilter.type && dataTypeFilter.type.type &&
                dataSpecType !== dataTypeFilter.type.type &&
                !(dataSpecSupertypes[dataTypeFilter.type.type] || [])
                .includes(dataSpecType)
              ) {
                typeRejected = true;
              }
              break;
            case 'typeOrSubtype':
              if (dataTypeFilter.type && dataTypeFilter.type.type &&
                dataSpecType !== dataTypeFilter.type.type &&
                !(dataSpecSubtypes[dataTypeFilter.type.type] || []).includes(dataSpecType)
              ) {
                typeRejected = true;
              }
              break;
            case 'forbiddenType':
              if (dataTypeFilter.forbiddenType && dataTypeFilter.forbiddenType.type &&
                dataTypeFilter.forbiddenType.type === dataSpecType &&
                !(dataTypeFilter.ignoredContexts || []).includes(placementContext)
              ) {
                typeRejected = true;
              }
              break;
          }
          if (typeRejected) {
            break;
          }
        }
        if (!typeRejected) {
          allowedDataSpecTypes.push(dataSpecType);
        }
      }

      return allowedDataSpecTypes.map((dataSpecType) => ({
        value: dataSpecType,
        label: translateDataSpecType(i18n, dataSpecType),
      }));
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  selectorPlaceholder: computed('placementContext', function selectorPlaceholder() {
    const placementContext = this.get('placementContext');
    const translationName = placementContext === 'array' ? 'array' : 'default';
    return this.t(`placeholder.${translationName}`);
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
