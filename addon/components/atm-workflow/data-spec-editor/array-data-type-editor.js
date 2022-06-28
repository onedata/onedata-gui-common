import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { translateDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec';
import layout from '../../../templates/components/atm-workflow/data-spec-editor/array-data-type-editor';

export default Component.extend({
  classNames: ['data-type-editor', 'array-data-type-editor'],
  layout,

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
   * @virtual
   * @type {() => void}
   */
  onFocusLost: undefined,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  dataTypeTranslation: computed(function dataTypeTranslation() {
    return translateDataSpecType(this.get('i18n'), 'array');
  }),

  /**
   * @virtual
   * @type {Array<DataSpecEditorFilter>}
   */
  dataTypeFiltersForItems: computed(
    'dataTypeFilters',
    function dataTypeFiltersForItems() {
      const dataTypeFilters = this.get('dataTypeFilters') || [];
      return dataTypeFilters.map((dataTypeFilter) => {
        switch (dataTypeFilter.filterType) {
          case 'typeOrSupertype':
          case 'typeOrSubtype': {
            const itemType =
              extractItemTypeFromArrayDataSpec(dataTypeFilter.type);
            return itemType ? Object.assign({}, dataTypeFilter, {
              type: itemType,
            }) : null;
          }
          case 'forbiddenType':
            return dataTypeFilter;
          default:
            return null;
        }
      }).filter(Boolean);
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
    itemElementChanged(itemElement) {
      this.notifyElementChange(Object.assign({}, this.get('editorElement'), {
        config: Object.assign({}, this.get('editorElement.config'), {
          item: itemElement,
        }),
      }));
    },
  },
});

function extractItemTypeFromArrayDataSpec(arrayDataSpec) {
  if (
    !arrayDataSpec ||
    arrayDataSpec.type !== 'array' ||
    !get(arrayDataSpec, 'valueConstraints.itemDataSpec')
  ) {
    return null;
  }

  return arrayDataSpec.valueConstraints.itemDataSpec;
}
