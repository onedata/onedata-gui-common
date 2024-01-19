/**
 * Provides a form element capable of showing, creating and modifying data specs.
 * It also provides two methods for conversion between form values and data spec
 * in both directions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import {
  get,
  set,
  computed,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import {
  createDataTypeSelectorElement,
  createDataTypeElement,
} from './editor-element-creators';
import paramsEditors from './params-editors';
import { validator } from 'ember-cp-validations';

/**
 * @typedef {Object} DataSpecEditorElementBase
 * @property {string} id
 */

/**
 * @typedef {DataSpecEditorElementBase} DataSpecEditorDataTypeSelector
 * @property {'dataTypeSelector'} type
 * @property {DataSpecEditorDataTypeSelectorConfig} config
 */

/**
 * @typedef {Object} DataSpecEditorDataTypeSelectorConfig
 * @property {boolean} includeExpandParams
 */

/**
 * @typedef {DataSpecEditorElementBase} DataSpecEditorDataType
 * @property {'dataType'} type
 * @property {DataSpecEditorDataTypeConfig} config
 */

/**
 * @typedef {DataSpecEditorDataTypeSelector|DataSpecEditorDataType} DataSpecEditorElement
 */

/**
 * @typedef {Object} DataSpecEditorDataTypeSimpleConfig
 * @property {
 *   'number' |
 *   'boolean' |
 *   'string' |
 *   'object' |
 *   'dataset' |
 *   'range'
 * } dataType
 * @property {boolean} includeExpandParams see "showExpandParams" in DataSpecEditor field
 */

/**
 * @typedef {Object} DataSpecEditorDataTypeArrayConfig
 * @property {'array'} dataType
 * @property {boolean} includeExpandParams see "showExpandParams" in DataSpecEditor field
 * @property {DataSpecEditorDataTypeConfig} item
 */

/**
 * @typedef {Object} DataSpecEditorDataTypeCustomConfig
 * @property {'file'|'timeSeriesMeasurement'} dataType
 * @property {boolean} includeExpandParams see "showExpandParams" in DataSpecEditor field
 * @property {Utils.FormComponent.ValuesContainer} formValues
 */

/**
 * @typedef {
 *   DataSpecEditorDataTypeSimpleConfig |
 *   DataSpecEditorDataTypeArrayConfig |
 *   DataSpecEditorDataTypeCustomConfig
 * } DataSpecEditorDataTypeConfig
 */

/**
 * @typedef {Object} DataSpecEditorElementContext
 * @property {DataSpecEditorElement} editorElement
 * @property {Utils.FormComponent.FormFieldsRootGroup} [formRootGroup]
 */

export const FormElement = FormField.extend({
  /**
   * Array of filters used to narrow available data types.
   * @virtual
   * @type {Array<AtmDataSpecFilter>}
   */
  dataSpecFilters: undefined,

  /**
   * If set to true, it will show additional data spec options (each type has its
   * own set), which are responsible for controlling the process of atm values
   * expanding during atm execution. Value expanding fills a basic value
   * representation with additional (optional) data. Example: for
   * file atm value expanding will introduce additional file attributes into
   * file the object.
   * @virtual optional
   * @type {boolean}
   */
  showExpandParams: false,

  /**
   * @override
   */
  i18nPrefix: 'utils.atmWorkflow.dataSpecEditor',

  /**
   * Do not take parent fields group translation path into account
   * @override
   */
  translationPath: '',

  /**
   * @override
   */
  fieldComponentName: 'atm-workflow/data-spec-editor',

  /**
   * @override
   */
  internalClasses: 'nowrap-on-desktop',

  /**
   * @override
   */
  withValidationIcon: false,

  /**
   * @override
   */
  areValidationClassesEnabled: false,

  /**
   * @override
   */
  withValidationMessage: false,

  /**
   * @type {Map<string, DataSpecEditorElementContext>}
   */
  editorElementsContextMapCache: null,

  /**
   * Contains contextual data for editor elements. For now it preserves only `formRootGroup`
   * for each editor element with dedicated params form. It allows
   * to have the same form state regardless element nesting manipulation and component
   * rerenders.
   * @type {ComputedProperty<Map<string, DataSpecEditorElementContext>>}
   */
  editorElementsContextMap: computed('value', function editorElementsContextMap() {
    const {
      editorElementsContextMapCache: elementsMap,
      value,
      mode,
    } = this.getProperties('editorElementsContextMapCache', 'value', 'mode');

    const proviousElementIds = new Set(elementsMap.keys());

    const currentElementIds = new Set();
    const elementsToProcess = [value];
    while (elementsToProcess.length) {
      const newElement = elementsToProcess.pop();
      if (!newElement) {
        continue;
      }
      currentElementIds.add(newElement.id);

      const mapValue =
        Object.assign({}, elementsMap.get(newElement.id) || {}, {
          element: newElement,
        });
      elementsMap.set(newElement.id, mapValue);

      if (newElement.type === 'dataType') {
        const dataType = get(newElement, 'config.dataType');
        switch (dataType) {
          case 'array':
            elementsToProcess.push(get(newElement, 'config.item'));
            break;
          default: {
            const dataTypeEditorClass = dataType in paramsEditors &&
              paramsEditors[dataType].FormElement;
            if (!mapValue.formRootGroup && dataTypeEditorClass) {
              mapValue.formRootGroup = EditorElementFormRootGroup.create({
                ownerSource: this,
                dataSpecEditorInstance: this,
                dataTypeEditorClass,
                showExpandParams: newElement.config.includeExpandParams,
              });
              mapValue.formRootGroup.changeMode(mode);
            }
            break;
          }
        }
      }
    }

    for (const elementId of proviousElementIds) {
      if (!currentElementIds.has(elementId)) {
        const elementToRemove = elementsMap.get(elementId);
        if (elementToRemove.formRootGroup) {
          elementToRemove.formRootGroup.destroy();
        }
        elementsMap.delete(elementId);
      }
    }

    return elementsMap;
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  nestedForms: computed('editorElementsContextMap', function nestedForms() {
    const forms = [];
    for (const elementCtx of this.get('editorElementsContextMap').values()) {
      if (elementCtx.formRootGroup) {
        forms.push(elementCtx.formRootGroup);
      }
    }
    return forms;
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  areNestedFormsValid: computed(
    'nestedForms.@each.isValid',
    function areNestedFormsValid() {
      return !this.nestedForms.findBy('isValid', false);
    }
  ),

  /**
   * @type {ComputedProperty<Object>}
   */
  nestedFormsValidator: computed(() => validator('inline', {
    validate(value, options, model) {
      const field = get(model, 'field');
      return field.areNestedFormsValid;
    },
  })),

  /**
   * @type {ComputedProperty<Object>}
   */
  leftDataTypeSelectorsValidator: computed(() =>
    validator('inline', {
      validate(value, options, model) {
        const editorElementsContextMap = get(model, 'field.editorElementsContextMap');
        for (const { element } of editorElementsContextMap.values()) {
          if (get(element, 'type') === 'dataTypeSelector') {
            return false;
          }
        }
        return true;
      },
    })
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    this.set('editorElementsContextMapCache', new Map());
    this.registerInternalValidator('nestedFormsValidator');
    this.registerInternalValidator('leftDataTypeSelectorsValidator');
  },

  /**
   * @override
   */
  updateOwner() {
    this._super(...arguments);

    const ownerSource = this.get('ownerSource');
    if (ownerSource) {
      for (const form of this.nestedForms) {
        if (!get(form, 'ownerSource')) {
          set(form, 'ownerSource', ownerSource);
        }
      }
    }
  },

  /**
   * @overide
   */
  changeMode(mode) {
    this._super(...arguments);
    this.nestedForms.forEach((form) => form.changeMode(mode));
  },
});

const EditorElementFormRootGroup = FormFieldsRootGroup.extend({
  dataSpecEditorInstance: undefined,
  dataTypeEditorClass: undefined,
  onNotifyAboutChange: undefined,
  fields: computed(function fields() {
    return [this.get('dataTypeEditorClass').create({ name: 'dataTypeEditor' })];
  }),
  isEnabled: reads('dataSpecEditorInstance.isEffectivelyEnabled'),
  showExpandParams: false,
  onValueChange() {
    this._super(...arguments);
    const onNotifyAboutChange = this.get('onNotifyAboutChange');
    if (onNotifyAboutChange) {
      onNotifyAboutChange();
    }
  },
  onFocusLost() {
    this._super(...arguments);
    this.get('dataSpecEditorInstance').focusLost();
  },
});

export function dataSpecToFormValues(dataSpec, includeExpandParams = false) {
  if (!dataSpec || !dataSpec.type) {
    return createDataTypeSelectorElement({
      includeExpandParams,
    });
  }

  const dataType = dataSpec.type;

  if (dataType in paramsEditors) {
    return createDataTypeElement(dataType, {
      includeExpandParams,
      formValues: createValuesContainer({
        dataTypeEditor: paramsEditors[dataType]
          .atmDataSpecParamsToFormValues(dataSpec, includeExpandParams),
      }),
    });
  } else if (dataType === 'array') {
    return createDataTypeElement(dataType, {
      includeExpandParams,
      item: dataSpecToFormValues(dataSpec.itemDataSpec),
    });
  } else {
    return createDataTypeElement(dataType, { includeExpandParams });
  }
}

export function formValuesToDataSpec(values) {
  if (
    !values ||
    values.type !== 'dataType' ||
    !values.config ||
    !values.config.dataType
  ) {
    return null;
  }

  const dataType = values.config.dataType;

  if (dataType in paramsEditors) {
    const dataTypeEditorValues =
      get(values.config, 'formValues.dataTypeEditor');
    return {
      type: dataType,
      ...paramsEditors[dataType].formValuesToAtmDataSpecParams(
        dataTypeEditorValues,
        values.config.includeExpandParams
      ),
    };
  } else if (dataType === 'array') {
    return {
      type: dataType,
      itemDataSpec: formValuesToDataSpec(values.config.item),
    };
  } else {
    return {
      type: dataType,
    };
  }
}
