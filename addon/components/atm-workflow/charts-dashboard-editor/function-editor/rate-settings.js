/**
 * "rate" function settings component.
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

  formValuesUpdater: observer('chartFunction.timeSpan', function formValuesUpdater() {
    const newTimeSpan = this.chartFunction?.timeSpan ?? '1';
    if (newTimeSpan !== this.form.valuesSource.timeSpan) {
      set(this.form.valuesSource, 'timeSpan', newTimeSpan);
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
    if (this.form.getFieldByPath('timeSpan').isValid) {
      normalizedValue = Number.parseFloat(value);
    }

    const action = this.actionsFactory.createChangeElementPropertyAction({
      element: this.chartFunction,
      propertyName: 'timeSpan',
      newValue: normalizedValue,
      changeType: 'continuous',
    });
    action.execute();
  },
});

/**
 * @type {Utils.FormComponent.NumberField}
 */
const TimeSpanField = NumberField.extend({
  name: 'timeSpan',
  integer: true,
  gt: 0,
});

/**
 * @type {Utils.FormComponent.FormFieldsRootGroup}
 */
const Form = SettingsForm.extend({
  /**
   * @override
   */
  fields: computed(() => [
    TimeSpanField.create(),
  ]),
});
