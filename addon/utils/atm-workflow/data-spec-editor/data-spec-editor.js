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
import valueConstraintsEditors from './value-constraints-editors';
import { validator } from 'ember-cp-validations';

/**
 * @typedef {Object} DataSpecEditorElementBase
 * @property {string} id
 */

/**
 * @typedef {DataSpecEditorElementBase} DataSpecEditorDataTypeSelector
 * @property {'dataTypeSelector'} type
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
 *   'integer' |
 *   'boolean' |
 *   'string' |
 *   'object' |
 *   'dataset' |
 *   'range'
 * } dataType
 */

/**
 * @typedef {Object} DataSpecEditorDataTypeArrayConfig
 * @property {'array'} dataType
 * @property {DataSpecEditorDataTypeConfig} item
 */

/**
 * @typedef {Object} DataSpecEditorDataTypeCustomConfig
 * @property {'file'|'timeSeriesMeasurement'} dataType
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
   * for each editor element with dedicated value constraints form. It allows
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
            const dataTypeEditorClass = dataType in valueConstraintsEditors &&
              valueConstraintsEditors[dataType].FormElement;
            if (!mapValue.formRootGroup && dataTypeEditorClass) {
              mapValue.formRootGroup = EditorElementFormRootGroup.create({
                ownerSource: this,
                dataSpecEditorInstance: this,
                dataTypeEditorClass,
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
   * @type {ComputedProperty<Object>}
   */
  nestedFormsValidator: computed(() => validator(function (value, options, model) {
    const field = get(model, 'field');
    return !field.getNestedForms().findBy('isValid', false);
  })),

  /**
   * @type {ComputedProperty<Object>}
   */
  leftDataTypeSelectorsValidator: computed(() =>
    validator(function (value, options, model) {
      const editorElementsContextMap = get(model, 'field.editorElementsContextMap');
      for (const { element } of editorElementsContextMap.values()) {
        if (get(element, 'type') === 'dataTypeSelector') {
          return false;
        }
      }
      return true;
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
      for (const form of this.getNestedForms()) {
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
    this.getNestedForms().forEach((form) => form.changeMode(mode));
  },

  /**
   * @returns {Array<Utils.FormComponent.FormFieldsRootGroup>}
   */
  getNestedForms() {
    const forms = [];
    for (const elementCtx of this.get('editorElementsContextMap').values()) {
      if (elementCtx.formRootGroup) {
        forms.push(elementCtx.formRootGroup);
      }
    }
    return forms;
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

export function dataSpecToFormValues(dataSpec) {
  if (!dataSpec || !dataSpec.type) {
    return createDataTypeSelectorElement();
  }

  const dataType = dataSpec.type;
  const valueConstraints = dataSpec.valueConstraints || {};

  if (dataType in valueConstraintsEditors) {
    return createDataTypeElement(dataType, {
      formValues: createValuesContainer({
        dataTypeEditor: valueConstraintsEditors[dataType]
          .valueConstraintsToFormValues(valueConstraints),
      }),
    });
  } else if (dataType === 'array') {
    return createDataTypeElement(dataType, {
      item: dataSpecToFormValues(valueConstraints.itemDataSpec),
    });
  } else {
    return createDataTypeElement(dataType);
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

  if (dataType in valueConstraintsEditors) {
    const dataTypeEditorValues =
      get(values.config, 'formValues.dataTypeEditor');
    return {
      type: dataType,
      valueConstraints: valueConstraintsEditors[dataType]
        .formValuesToValueConstraints(dataTypeEditorValues),
    };
  } else if (dataType === 'array') {
    return {
      type: dataType,
      valueConstraints: {
        itemDataSpec: formValuesToDataSpec(values.config.item),
      },
    };
  } else {
    return {
      type: dataType,
      valueConstraints: {},
    };
  }
}
