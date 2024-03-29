/**
 * Provides a form element capable of showing and modifying string
 * data spec params. It also provides two methods for conversion
 * between form values and data spec params in both directions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import validate from 'onedata-gui-common/utils/atm-workflow/value-validators/string';
import {
  ValueEditorField as AtmValueEditorField,
  rawValueToFormValue as atmRawValueToFormValue,
  formValueToRawValue as atmFormValueToRawValue,
} from 'onedata-gui-common/utils/atm-workflow/value-editors';

const i18nPrefix = 'utils.atmWorkflow.dataSpecEditor.paramsEditors.string';

const FormElement = FormFieldsGroup.extend({
  /**
   * @virtual
   * @type {Array<AtmDataSpecFilter>}
   */
  dataSpecFilters: undefined,

  /**
   * @override
   */
  classes: 'string-data-spec-params-editor params-editors',

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
      AllowedValuesEditor.create(),
    ];
  }),
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
      type: AtmDataSpecType.String,
    },
  }),
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from string editor
 * @returns {Omit<AtmStringDataSpec, 'type'>}
 */
function formValuesToAtmDataSpecParams(values) {
  const params = {};

  const allowedValues = atmFormValueToRawValue(values?.allowedValues);
  if (Array.isArray(allowedValues)) {
    params.allowedValues = allowedValues;
  }

  return params;
}

/**
 * @param {AtmStringDataSpec} atmDataSpec
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in
 *   a form
 */
function atmDataSpecParamsToFormValues(atmDataSpec) {
  return createValuesContainer({
    allowedValues: atmRawValueToFormValue(atmDataSpec?.allowedValues, true),
  });
}

/**
 * @param {Ember.Service} i18n
 * @param {Utils.FormComponent.ValuesContainer} values
 * @returns {SafeString}
 */
function summarizeFormValues(i18n, values) {
  let allowedStringsText = '';

  if (values?.allowedValues?.hasValue) {
    const allowedValues = values.allowedValues.value;
    const validAllowedValues = allowedValues?.filter((value) => validate(value, {
      type: AtmDataSpecType.String,
    }));
    if (validAllowedValues?.length) {
      allowedStringsText = validAllowedValues.map((s) => `"${s}"`).join(', ');
    } else {
      allowedStringsText = i18n.t(`${i18nPrefix}.summary.allowedStrings.none`);
    }
  } else {
    allowedStringsText = i18n.t(`${i18nPrefix}.summary.allowedStrings.any`);
  }

  return i18n.t(`${i18nPrefix}.summary.base`, {
    allowedStrings: allowedStringsText,
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
