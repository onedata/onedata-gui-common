import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  dataSpecTypes,
  dataSpecSupertypes,
  dataSpecSubtypes,
  translateDataSpecType,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
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
   * @type {DataSpecPlacementContext}
   */
  placementContext: undefined,

  /**
   * @virtual
   * @type {Array<DataSpecFilter>}
   */
  dataSpecFilters: undefined,

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
   * @type {ComputedProperty<{ value: string, label: SafeString }>}
   */
  selectorOptions: computed(
    'dataSpecFilters',
    'placementContext',
    function selectorOptions() {
      const {
        i18n,
        dataSpecFilters,
        placementContext,
      } = this.getProperties('i18n', 'dataSpecFilters', 'placementContext');

      const allowedDataSpecTypes = [];
      for (const dataSpecType of dataSpecTypes) {
        let typeRejected = false;
        for (const dataSpecFilter of (dataSpecFilters || [])) {
          switch (dataSpecFilter.filterType) {
            case 'typeOrSupertype': {
              let thisFilterRejects = true;
              for (const filteredType of dataSpecFilter.types) {
                if (
                  filteredType.type && (
                    dataSpecType === filteredType.type ||
                    (dataSpecSupertypes[filteredType.type] || []).includes(dataSpecType)
                  )
                ) {
                  thisFilterRejects = false;
                }
              }
              typeRejected = typeRejected || thisFilterRejects;
              break;
            }
            case 'typeOrSubtype': {
              let thisFilterRejects = true;
              for (const filteredType of dataSpecFilter.types) {
                if (
                  filteredType.type && (
                    dataSpecType === filteredType.type ||
                    (dataSpecSubtypes[filteredType.type] || []).includes(dataSpecType)
                  )
                ) {
                  thisFilterRejects = false;
                }
              }
              typeRejected = typeRejected || thisFilterRejects;
              break;
            }
            case 'forbiddenType': {
              let thisFilterRejects = false;
              if ((dataSpecFilter.ignoredContexts || []).includes(placementContext)) {
                break;
              }
              for (const filteredType of dataSpecFilter.forbiddenTypes) {
                if (filteredType.type && dataSpecType === filteredType.type) {
                  thisFilterRejects = true;
                }
              }
              typeRejected = typeRejected || thisFilterRejects;
              break;
            }
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
