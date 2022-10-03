/**
 * Renders a representation of data spec type. In simple cases it is only name + toolbar.
 * It more complicated (like "timeSeriesMeasurement" type) renders also a form with
 * additional controls for value constraints.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, set, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { translateDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import valueConstraintsEditors from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/value-constraints-editors';
import layout from '../../../templates/components/atm-workflow/data-spec-editor/default-data-type-editor';

export default Component.extend({
  classNames: ['data-type-editor', 'default-data-type-editor'],
  layout,

  i18n: service(),

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
   * @type {AtmDataSpecPlacementContext}
   */
  placementContext: undefined,

  /**
   * @virtual
   * @type {Array<AtmDataSpecFilter>}
   */
  dataSpecFilters: undefined,

  /**
   * @virtual
   * @type {DataSpecEditorElement}
   */
  editorElement: undefined,

  /**
   * @virtual
   * @type {Map<string, DataSpecEditorElementContext>}
   */
  editorElementsContextMap: undefined,

  /**
   * @virtual
   * @type {(updatedElement: DataSpecEditorElement) => void}
   */
  onElementChange: undefined,

  /**
   * @type {boolean}
   */
  isFormVisible: false,

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
  formRootGroup: computed(
    'editorElementsContextMap',
    'editorElement.id',
    function formRootGroup() {
      const elementContext =
        this.get('editorElementsContextMap').get(this.get('editorElement.id'));
      return elementContext && elementContext.formRootGroup;
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ValuesContainer|undefined>}
   */
  formValues: reads('editorElement.config.formValues'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  formSummary: computed('dataType', 'formValues', function formSummary() {
    const {
      dataType,
      formValues,
      i18n,
    } = this.getProperties('dataType', 'formValues', 'i18n');

    const summarizeFormValues = dataType in valueConstraintsEditors &&
      valueConstraintsEditors[dataType].summarizeFormValues;
    if (summarizeFormValues) {
      return summarizeFormValues(i18n, get(formValues || {}, 'dataTypeEditor'));
    }
  }),

  /**
   * @type {ComputedProperty<() => void>}
   */
  notifyFormChangeCallback: computed(function notifyFormChangeCallback() {
    return () => this.notifyFormChange();
  }),

  formRootSetuper: observer(
    'formRootGroup',
    'formValues',
    'dataSpecFilters',
    'notifyFormChangeCallback',
    function formRootSetuper() {
      if (!this.formRootGroup) {
        return;
      }

      if (this.formValues && this.formValues !== this.formRootGroup.valuesSource) {
        set(this.formRootGroup, 'valuesSource', this.formValues);
      }

      if (this.formRootGroup.onNotifyAboutChange !== this.notifyFormChangeCallback) {
        set(this.formRootGroup, 'onNotifyAboutChange', this.notifyFormChangeCallback);
      }

      const dataTypeEditor = this.formRootGroup.getFieldByPath('dataTypeEditor');
      if (dataTypeEditor && dataTypeEditor.dataSpecFilters !== this.dataSpecFilters) {
        set(dataTypeEditor, 'dataSpecFilters', this.dataSpecFilters);
      }
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.formRootSetuper();
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

  notifyFormChange() {
    // Prepare shallow copy of the editorElement only to introduce some difference.
    // Form values are collected in EmberObject `formValues` and are mutated in place.
    this.notifyElementChange(Object.assign({}, this.get('editorElement')));
  },

  actions: {
    toggleFormVisibility() {
      this.toggleProperty('isFormVisible');
    },
  },
});
