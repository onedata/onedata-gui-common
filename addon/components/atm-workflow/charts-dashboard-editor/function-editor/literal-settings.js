/**
 * "literal" function settings component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set, computed, observer } from '@ember/object';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import FunctionSettingsBase, { SettingsForm } from './function-settings-base';

export default FunctionSettingsBase.extend({
  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  form: computed(function form() {
    return Form.create({
      component: this,
    });
  }),

  formValuesUpdater: observer('chartFunction.data', function formValuesUpdater() {
    const newValue = this.chartFunction?.data ?? '1';
    if (newValue !== this.form.valuesSource.value) {
      set(this.form.valuesSource, 'value', newValue);
    }

    this.form.invalidFields.forEach((field) => field.markAsModified());
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.formValuesUpdater();
  },

  /**
   * @override
   */
  onValueChange(fieldName, value) {
    let normalizedValue = value;
    if (this.form.getFieldByPath('value').isValid) {
      normalizedValue = Number.parseFloat(value);
    }

    const action = this.actionsFactory.createChangeElementPropertyAction({
      element: this.chartFunction,
      propertyName: 'data',
      newValue: normalizedValue,
      changeType: 'continuous',
    });
    action.execute();
  },
});

/**
 * @type {Utils.FormComponent.TextField}
 */
const ValueField = NumberField.extend({
  name: 'value',
});

/**
 * @type {Utils.FormComponent.FormFieldsRootGroup}
 */
const Form = SettingsForm.extend({
  /**
   * @override
   */
  fields: computed(() => [
    ValueField.create(),
  ]),
});
