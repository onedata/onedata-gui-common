import { set, computed, observer } from '@ember/object';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { ReplaceEmptyStrategy } from 'onedata-gui-common/utils/time-series-dashboard';
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

  formValuesUpdater: observer(
    'chartFunction.{strategy,fallbackValue}',
    function formValuesUpdater() {
      const newFallbackValue = this.chartFunction?.fallbackValue ?? '';
      if (newFallbackValue !== this.form.valuesSource.fallbackValue) {
        set(this.form.valuesSource, 'fallbackValue', newFallbackValue);
      }

      const newUsePreviousStrategy =
        this.chartFunction?.strategy === ReplaceEmptyStrategy.UsePrevious;
      if (newUsePreviousStrategy !== this.form.valuesSource.usePreviousStrategy) {
        set(this.form.valuesSource, 'usePreviousStrategy', newUsePreviousStrategy);
      }

      this.form.invalidFields.forEach((field) => field.markAsModified());
    }
  ),

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
    if (fieldName === 'fallbackValue') {
      if (this.form.getFieldByPath('fallbackValue').isValid) {
        normalizedValue = value === '' ? null : Number.parseFloat(value);
      }
    } else {
      normalizedValue =
        value ? ReplaceEmptyStrategy.UsePrevious : ReplaceEmptyStrategy.UseFallback;
    }

    const action = this.actionsFactory.createChangeElementPropertyAction({
      element: this.chartFunction,
      propertyName: fieldName === 'fallbackValue' ? 'fallbackValue' : 'strategy',
      newValue: normalizedValue,
      changeType: fieldName === 'fallbackValue' ? 'continuous' : 'discrete',
    });
    action.execute();
  },
});

/**
 * @type {Utils.FormComponent.NumberField}
 */
const FallbackValueField = NumberField.extend({
  name: 'fallbackValue',
  isOptional: true,
});

/**
 * @type {Utils.FormComponent.ToggleField}
 */
const UsePreviousStrategyField = ToggleField.extend({
  name: 'usePreviousStrategy',
});

/**
 * @type {Utils.FormComponent.FormFieldsRootGroup}
 */
const Form = SettingsForm.extend({
  /**
   * @override
   */
  fields: computed(() => [
    FallbackValueField.create(),
    UsePreviousStrategyField.create(),
  ]),
});
