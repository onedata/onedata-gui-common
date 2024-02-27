/**
 * Provides a form element capable of showing and modifying number
 * data spec params. It also provides two methods for conversion
 * between form values and data spec params in both directions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { gt, raw } from 'ember-awesome-macros';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import {
  AtmDataSpecType,
  getAtmDataSpecParamsConditions,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import validate from 'onedata-gui-common/utils/atm-workflow/value-validators/number';
import {
  ValueEditorField as AtmValueEditorField,
  rawValueToFormValue as atmRawValueToFormValue,
  formValueToRawValue as atmFormValueToRawValue,
} from 'onedata-gui-common/utils/atm-workflow/value-editors';
import { formatNumber } from 'onedata-gui-common/helpers/format-number';
import { htmlSafe } from '@ember/template';

const i18nPrefix = 'utils.atmWorkflow.dataSpecEditor.paramsEditors.number';

const FormElement = FormFieldsGroup.extend({
  /**
   * @virtual
   * @type {Array<AtmDataSpecFilter>}
   */
  dataSpecFilters: undefined,

  /**
   * @override
   */
  classes: 'number-data-spec-params-editor params-editors',

  /**
   * @override
   */
  i18nPrefix: `${i18nPrefix}.fields`,

  /**
   * Does not take parent fields group translation path into account
   * @override
   */
  translationPath: '',

  /**
   * @override
   */
  size: 'sm',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      IntegersOnlyToggle.create(),
      AllowedValuesEditor.create(),
    ];
  }),

  /**
   * @type {ComputedProperty<Array<boolean>>}
   */
  integersOnlyParamValues: computed(
    'dataSpecFilters',
    function integersOnlyParamValues() {
      const conditions = getAtmDataSpecParamsConditions(
        AtmDataSpecType.Number,
        this.dataSpecFilters ?? []
      );
      return conditions.integersOnlyParamValues;
    }
  ),
});

const IntegersOnlyToggle = ToggleField.extend({
  /**
   * @override
   */
  name: 'integersOnly',

  /**
   * @override
   */
  defaultValue: reads('parent.integersOnlyParamValues.0'),

  /**
   * @override
   */
  isEnabled: gt('parent.integersOnlyParamValues.length', raw(1)),

  paramValuesObserver: observer(
    'parent.integersOnlyParamValues',
    function paramValuesObserver() {
      scheduleOnce('afterRender', this, 'adjustValueForNewParamValues');
    }
  ),

  adjustValueForNewParamValues() {
    safeExec(this, () => {
      if (!this.parent.integersOnlyParamValues.includes(this.value)) {
        this.valueChanged(this.parent.integersOnlyParamValues[0]);
      }
    });
  },
});

const AllowedValuesEditor = AtmValueEditorField.extend({
  /**
   * @override
   */
  name: 'allowedValues',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  atmDataSpec: Object.freeze({
    type: AtmDataSpecType.Array,
    itemDataSpec: {
      type: AtmDataSpecType.Number,
    },
  }),
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from number editor
 * @returns {Omit<AtmNumberDataSpec, 'type'>}
 */
function formValuesToAtmDataSpecParams(values) {
  const params = {};

  if (typeof values?.integersOnly === 'boolean') {
    params.integersOnly = values.integersOnly;
  }

  const allowedValues = atmFormValueToRawValue(values?.allowedValues);
  if (Array.isArray(allowedValues)) {
    params.allowedValues = allowedValues;
  }

  return params;
}

/**
 * @param {AtmNumberDataSpec} atmDataSpec
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in
 *   a form
 */
function atmDataSpecParamsToFormValues(atmDataSpec) {
  return createValuesContainer({
    integersOnly: Boolean(atmDataSpec?.integersOnly),
    allowedValues: atmRawValueToFormValue(atmDataSpec?.allowedValues, true),
  });
}

/**
 * @param {Ember.Service} i18n
 * @param {Utils.FormComponent.ValuesContainer} values
 * @returns {SafeString}
 */
function summarizeFormValues(i18n, values) {
  const integersOnly = Boolean(values?.integersOnly);
  let allowedNumbersText = '';

  if (values?.allowedValues?.hasValue) {
    const allowedValues = values.allowedValues.value;
    const validAllowedValues = allowedValues?.filter((value) => validate(value, {
      type: AtmDataSpecType.Number,
      integersOnly,
    }));
    if (validAllowedValues?.length) {
      allowedNumbersText = htmlSafe(
        validAllowedValues.map((val) => formatNumber(val)).join(', ')
      );
    } else {
      allowedNumbersText = i18n.t(`${i18nPrefix}.summary.allowedNumbers.none`);
    }
  } else {
    const i18nKey = values?.integersOnly ? 'integersOnly' : 'any';
    allowedNumbersText = i18n.t(`${i18nPrefix}.summary.allowedNumbers.${i18nKey}`);
  }

  return i18n.t(`${i18nPrefix}.summary.base`, {
    allowedNumbers: allowedNumbersText,
  });
}

/**
 * @param {Utils.FormComponent.ValuesContainer} values
 * @returns {boolean}
 */
function shouldWarnOnRemove(values) {
  return values?.allowedValues?.hasValue && values.allowedValues.value?.length > 0;
}

export default {
  FormElement,
  formValuesToAtmDataSpecParams,
  atmDataSpecParamsToFormValues,
  summarizeFormValues,
  shouldWarnOnRemove,
};
