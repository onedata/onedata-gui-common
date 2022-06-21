import Component from '@ember/component';
import { computed, observer, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { translateDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec';
import layout from '../../../templates/components/atm-workflow/data-spec-editor/default-data-type-editor';

export default Component.extend({
  classNames: ['data-type-editor', 'default-data-type-editor'],
  layout,

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
   * @type {ComputedProperty<string>}
   */
  dataType: reads('editorElement.config.dataType'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  dataTypeTranslation: computed('dataType', function dataTypeTranslation() {
    const {
      dataType,
      i18n,
    } = this.getProperties('dataType', 'i18n');

    return translateDataSpecType(i18n, dataType);
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  formRootGroup: computed('editorElementsContextMap', 'editorElement.id', function formRootGroup() {
    const elementContext =
      this.get('editorElementsContextMap').get(this.get('editorElement.id'));
    return elementContext && elementContext.formRootGroup;
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ValuesContainer|undefined>}
   */
  formValues: reads('editorElement.config.formValues'),

  formValuesObserver: observer('formValues', function formValuesObserver() {
    const {
      formValues,
      formRootGroup,
    } = this.getProperties('formValues', 'formRootGroup');
    if (formValues && formRootGroup) {
      set(formRootGroup, 'valuesSource', formValues);
    }
  }),

  init() {
    this._super(...arguments);

    const formRootGroup = this.get('formRootGroup');
    if (formRootGroup) {
      set(
        formRootGroup,
        'onNotifyAboutChange',
        (formValues) => this.notifyFormChange(formValues)
      );
    }
  },

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

  notifyFormChange(formValues) {
    this.notifyElementChange(Object.assign({}, this.get('editorElement'), {
      config: Object.assign({}, this.get('editorElement.config'), {
        formValues,
      }),
    }));
  },
});
