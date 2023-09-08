/**
 * A form with all basic properties of a chart axis.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { tag, eq, not } from 'ember-awesome-macros';
import _ from 'lodash';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { timeSeriesStandardUnits, translateTimeSeriesStandardUnit } from 'onedata-gui-common/utils/time-series';
import { getUnitOptionsTypeForUnitName } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/axis-editor-form';

export default Component.extend(I18n, {
  layout,
  tagName: 'form',
  classNames: ['axis-editor-form', 'form', 'form-horizontal', 'form-component'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.chartEditor.axisEditorForm',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Axis}
   */
  axis: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  form: computed(function form() {
    return Form.create({
      component: this,
    });
  }),

  formValuesUpdater: observer(
    'axis.{name,unitName,minInterval}',
    'axis.unitOptions.{format,customName,useMetricSuffix}',
    function formValuesUpdater() {
      ['name', 'unitName'].forEach((fieldName) => {
        const newValue = this.axis?.[fieldName] ?? '';
        if (newValue !== this.form.valuesSource[fieldName]) {
          set(this.form.valuesSource, fieldName, newValue);
        }
      });

      const activeUnitOptionsGroup = this.form.activeUnitOptionsGroup;
      if (activeUnitOptionsGroup) {
        for (const key in (this.axis?.unitOptions ?? {})) {
          set(
            this.form.valuesSource,
            `${activeUnitOptionsGroup}.${key}`,
            this.axis.unitOptions[key]
          );
        }
      }

      if (
        !(
          (this.axis?.minInterval ?? null) === null &&
          !this.form.valuesSource.minInterval
        ) && !(
          typeof this.axis?.minInterval === 'number' &&
          this.axis.minInterval === Number.parseFloat(this.form.valuesSource.minInterval)
        ) && !(
          typeof this.axis?.minInterval === 'string' &&
          this.axis.minInterval === this.form.valuesSource.minInterval
        )
      ) {
        set(
          this.form.valuesSource,
          'minInterval',
          String(this.axis?.minInterval ?? '')
        );
      }

      this.form.invalidFields.forEach((field) => field.markAsModified());
    }
  ),

  init() {
    this._super(...arguments);
    this.formValuesUpdater();
  },

  /**
   * @param {string} fieldName
   * @param {string} value
   * @returns {void}
   */
  onValueChange(fieldName, value) {
    if (!fieldName) {
      return;
    }

    let changeType;
    switch (fieldName) {
      case 'name':
      case 'unitName':
      case 'minInterval':
      case 'customUnitOptions.customName':
        changeType = 'continuous';
        break;
      case 'bytesUnitOptions.format':
      case 'customUnitOptions.useMetricSuffix':
      default:
        changeType = 'discrete';
        break;
    }

    let normalizedFieldName = fieldName;
    if (
      fieldName.startsWith('bytesUnitOptions.') ||
      fieldName.startsWith('customUnitOptions.')
    ) {
      normalizedFieldName = `unitOptions.${fieldName.split('.')[1]}`;
    }

    let normalizedValue = value;
    if (fieldName === 'minInterval') {
      if (!value) {
        normalizedValue = null;
      } else if (this.form.getFieldByPath('minInterval').isValid) {
        normalizedValue = Number.parseFloat(value);
      }
    }

    const action = this.actionsFactory.createChangeElementPropertyAction({
      element: this.axis,
      propertyName: normalizedFieldName,
      newValue: normalizedValue,
      changeType,
    });
    action.execute();
  },

  /**
   * @returns {void}
   */
  onEditionInterrupted() {
    this.actionsFactory?.interruptActiveChangeElementPropertyAction();
  },
});

/**
 * @type {Utils.FormComponent.TextField}
 */
const NameField = TextField.extend({
  name: 'name',
});

/**
 * @type {Utils.FormComponent.DropdownField}
 */
const UnitNameField = DropdownField.extend({
  name: 'unitName',
  defaultValue: timeSeriesStandardUnits[0],
  options: computed(function options() {
    const units = timeSeriesStandardUnits.map((unit) => ({
      value: unit,
      label: translateTimeSeriesStandardUnit(this.i18n, unit),
    }));
    units.push({
      value: 'custom',
    });
    return units;
  }),
});

/**
 * @type {Utils.FormComponent.DropdownField}
 */
const BytesUnitFormatField = DropdownField.extend({
  name: 'format',
  defaultValue: 'iec',
  showSearch: false,
  options: Object.freeze([{
    value: 'iec',
    label: 'IEC',
  }, {
    value: 'si',
    label: 'SI',
  }]),
});

/**
 * @type {Utils.FormComponent.FormFieldsGroup}
 */
const BytesUnitOptionsFieldsGroup = FormFieldsGroup.extend({
  name: 'bytesUnitOptions',
  addColonToLabel: false,
  classes: 'unit-options-group',
  isVisible: eq('parent.activeUnitOptionsGroup', 'name'),
  fields: computed(() => [
    BytesUnitFormatField.create(),
  ]),
});

/**
 * @type {Utils.FormComponent.TextField}
 */
const CustomUnitNameField = TextField.extend({
  name: 'customName',
  isOptional: true,
});

/**
 * @type {Utils.FormComponent.ToggleField}
 */
const CustomUnitUseMetricSuffixField = ToggleField.extend({
  name: 'useMetricSuffix',
  defaultValue: false,
});

/**
 * @type {Utils.FormComponent.FormFieldsGroup}
 */
const CustomUnitOptionsFieldsGroup = FormFieldsGroup.extend({
  name: 'customUnitOptions',
  addColonToLabel: false,
  classes: 'unit-options-group',
  isVisible: eq('parent.activeUnitOptionsGroup', 'name'),
  fields: computed(() => [
    CustomUnitNameField.create(),
    CustomUnitUseMetricSuffixField.create(),
  ]),
});

/**
 * @type {Utils.FormComponent.NumberField}
 */
const MinIntervalField = NumberField.extend({
  name: 'minInterval',
  isOptional: true,
  gt: 0,
  inputType: 'text',
});

/**
 * @type {Utils.FormComponent.FormFieldsRootGroup}
 */
const Form = FormFieldsRootGroup.extend({
  /**
   * @virtual
   * @type {Components.AtmWorkflow.ChartsDashboardEditor.ChartEditor.AxisEditorForm}
   */
  component: undefined,

  /**
   * @override
   */
  ownerSource: reads('component'),

  /**
   * @override
   */
  i18nPrefix: tag `${'component.i18nPrefix'}.fields`,

  /**
   * @override
   */
  size: 'sm',

  /**
   * @override
   */
  isEnabled: not('component.isReadOnly'),

  /**
   * @override
   */
  fields: computed(() => [
    NameField.create(),
    UnitNameField.create(),
    BytesUnitOptionsFieldsGroup.create(),
    CustomUnitOptionsFieldsGroup.create(),
    MinIntervalField.create(),
  ]),

  /**
   * @type {ComputedProperty<'bytesUnitOptions' | 'customUnitOptions' | null>}
   */
  activeUnitOptionsGroup: computed(
    'valuesSource.unitName',
    function activeUnitOptionsGroup() {
      const unitOptionsType = getUnitOptionsTypeForUnitName(this.valuesSource.unitName);
      return unitOptionsType ? _.lowerFirst(unitOptionsType) : null;
    }
  ),

  /**
   * @override
   */
  onValueChange(value, field) {
    this._super(...arguments);
    this.component.onValueChange(field.path, value);
  },

  /**
   * @override
   */
  onFocusLost() {
    this._super(...arguments);
    this.component.onEditionInterrupted();
  },
});
