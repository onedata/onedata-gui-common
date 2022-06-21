import { get, observer, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import FieldComponentBase from 'onedata-gui-common/components/form-component/field-component-base';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import valueConstraintsEditors from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/value-constraints-editors';
import layout from '../../templates/components/atm-workflow/data-spec-editor';

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
 * @typedef {
 *   DataSpecEditorDataTypeSelector |
 *   DataSpecEditorDataType
 * } DataSpecEditorElement
 */

/**
 * @typedef {Object} DataSpecEditorDataTypeSimpleConfig
 * @property {
 *   'integer' |
 *   'string' |
 *   'object' |
 *   'dataset' |
 *   'range' |
 *   'onedatafsCredentials'
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
 *   DataSpecEditorDataTypeCustomConfig |
 * } DataSpecEditorDataTypeConfig
 */

/**
 * @typedef {Object} DataSpecEditorElementContext
 * @property {DataSpecEditorElement} editorElement
 * @property {Utils.FormComponent.FormFieldsRootGroup} [formRootGroup]
 */

export default FieldComponentBase.extend({
  layout,
  classNames: ['data-spec-editor'],

  /**
   * @type {Map<string, DataSpecEditorElementContext>}
   */
  editorElementsContextMap: undefined,

  valueObserver: observer('value', function valueObserver() {
    this.updateEditorElementsMap();
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    this.set('editorElementsContextMap', new Map());
    this.updateEditorElementsMap();
  },

  updateEditorElementsMap() {
    const {
      editorElementsContextMap,
      value,
    } = this.getProperties('editorElementsContextMap', 'value');
    const proviousElementIds = new Set(editorElementsContextMap.keys());

    const currentElementIds = new Set();
    const elementsToProcess = [value];
    while (elementsToProcess.length) {
      const newElement = elementsToProcess.pop();
      if (!newElement) {
        continue;
      }
      currentElementIds.add(newElement.id);

      const mapValue =
        Object.assign({}, editorElementsContextMap.get(newElement.id) || {}, {
          element: newElement,
        });
      editorElementsContextMap.set(newElement.id, mapValue);

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
                component: this,
                dataTypeEditorClass,
              });
            }
            break;
          }
        }
      }
    }

    for (const elementId of proviousElementIds) {
      if (!currentElementIds.has(elementId)) {
        editorElementsContextMap.delete(elementId);
      }
    }
  },
});

const EditorElementFormRootGroup = FormFieldsRootGroup.extend({
  component: undefined,
  dataTypeEditorClass: undefined,
  onNotifyAboutChange: undefined,
  ownerSource: reads('component'),
  fields: computed(function fields() {
    return [this.get('dataTypeEditorClass').create({ name: 'dataTypeEditor' })];
  }),
  onValueChange() {
    this._super(...arguments);
    const onNotifyAboutChange = this.get('onNotifyAboutChange');
    if (onNotifyAboutChange) {
      onNotifyAboutChange();
    }
  },
});
