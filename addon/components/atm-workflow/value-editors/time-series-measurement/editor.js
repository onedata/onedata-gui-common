/**
 * A time series measurement value editor component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, setProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import _ from 'lodash';
import { not } from 'ember-awesome-macros';
import EditorBase from '../commons/editor-base';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/value-editors/time-series-measurement/editor';

const formFieldNames = Object.freeze(['timestamp', 'tsName', 'value']);

export default EditorBase.extend(I18n, {
  layout,

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.valueEditors.timeSeriesMeasurement.editor',

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  formRootGroup: computed(function formRootGroup() {
    return FormRootGroup.create({ component: this });
  }),

  /**
   * @override
   */
  handleStateChange() {
    this._super(...arguments);
    if (!this.editorState) {
      return;
    }

    if (this.doesFormValueDiffer(this.editorState.value)) {
      const newFormData = formFieldNames.reduce((acc, fieldName) => {
        acc[fieldName] = String(this.editorState.value?.[fieldName] ?? '');
        return acc;
      }, {});
      setProperties(this.formRootGroup.valuesSource, newFormData);
    }
  },

  /**
   * @returns {void}
   */
  propagateValueChange() {
    this.editorState.value = this.getFormValues();
  },

  /**
   * @param {unknown} referenceValue
   * @returns {boolean}
   */
  doesFormValueDiffer(referenceValue) {
    return !_.isEqual(this.getFormValues(), referenceValue);
  },

  /**
   * @returns {number}
   */
  getFormValues() {
    const formValues = {};
    formFieldNames.forEach((fieldName) => {
      const field = this.formRootGroup.getFieldByPath(fieldName);
      const fieldValue = field.dumpValue();
      formValues[fieldName] = fieldName !== 'tsName' ?
        Number.parseFloat(fieldValue) : fieldValue;
    });
    return formValues;
  },
});

const FormRootGroup = FormFieldsRootGroup.extend({
  /**
   * @virtual
   * @type {Components.AtmWorkflow.ValueEditors.TimeSeriesMeasurement.Editor}
   */
  component: undefined,

  /**
   * @override
   */
  ownerSource: reads('component'),

  /**
   * @override
   */
  size: 'sm',

  /**
   * @override
   */
  i18nPrefix: reads('component.i18nPrefix'),

  /**
   * @override
   */
  isEnabled: not('component.isDisabled'),

  /**
   * @override
   */
  fields: computed(() => [
    NumberField.create({
      name: 'timestamp',
      integer: true,
      gte: 0,
      withValidationMessage: false,
    }),
    TextField.create({
      name: 'tsName',
      withValidationMessage: false,
    }),
    NumberField.create({
      name: 'value',
      withValidationMessage: false,
    }),
  ]),

  /**
   * @override
   */
  onValueChange() {
    this._super(...arguments);
    scheduleOnce('afterRender', this.component, 'propagateValueChange');
  },
});
