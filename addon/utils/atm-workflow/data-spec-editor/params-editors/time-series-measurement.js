/**
 * Provides a form element capable of showing and modifying time
 * series measurement data spec params. It also provides two methods
 * for conversion between form values and data spec params in both directions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set, get, getProperties, computed } from '@ember/object';
import { eq, raw } from 'ember-awesome-macros';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import {
  timeSeriesStandardUnits,
  timeSeriesCustomUnitPrefix,
  translateTimeSeriesStandardUnit,
} from 'onedata-gui-common/utils/time-series';
import {
  nameMatcherTypes,
  translateNameMatcherType,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types/time-series-measurement';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

const i18nPrefix = 'utils.atmWorkflow.dataSpecEditor.paramsEditors.timeSeriesMeasurement';

// A fake unit used to indicate that user provides some non-standard unit.
const customPseudoUnit = 'custom';

const FormElement = FormFieldsCollectionGroup.extend({
  classes: 'time-series-measurement-data-spec-params-editor data-spec-params-editor boxes-collection-layout',
  isDefaultValueIgnored: false,
  i18nPrefix: `${i18nPrefix}.fields`,
  // Does not take parent fields group translation path into account
  translationPath: '',
  sizeForChildren: 'sm',
  fieldFactoryMethod(uniqueFieldValueName) {
    const field = FormFieldsGroup.create({
      name: 'measurementSpec',
      valueName: uniqueFieldValueName,
      fields: [
        DropdownField.extend({
          options: computed(function options() {
            const i18n = this.get('i18n');
            return nameMatcherTypes.map((nameMatcherType) => ({
              value: nameMatcherType,
              label: translateNameMatcherType(i18n, nameMatcherType),
            }));
          }),
        }).create({
          name: 'nameMatcherType',
          defaultValue: nameMatcherTypes[0],
        }),
        TextField.create({
          name: 'nameMatcher',
        }),
        DropdownField.extend({
          options: computed(function options() {
            const i18n = this.get('i18n');
            return [...timeSeriesStandardUnits, customPseudoUnit].map((unit) => ({
              value: unit,
              label: unit !== customPseudoUnit ?
                translateTimeSeriesStandardUnit(i18n, unit) : undefined,
            }));
          }),
        }).create({
          name: 'unit',
          defaultValue: timeSeriesStandardUnits[0],
        }),
        TextField.extend({
          isVisible: eq('parent.value.unit', raw(customPseudoUnit)),
        }).create({
          name: 'customUnit',
        }),
      ],
    });
    field.changeMode(this.get('mode'));
    return field;
  },
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from time series measurement editor
 * @returns {Omit<AtmTimeSeriesMeasurementDataSpec, 'type'>}
 */
function formValuesToAtmDataSpecParams(values) {
  const specs = get(values, '__fieldsValueNames')
    .map((valueName) => get(values, valueName))
    .filter(Boolean)
    .map(measurementSpecValue => {
      const {
        nameMatcherType: formNameMatcherType,
        nameMatcher: formNameMatcher,
        unit: formUnit,
        customUnit: formCustomUnit,
      } = getProperties(
        measurementSpecValue,
        'nameMatcherType',
        'nameMatcher',
        'unit',
        'customUnit'
      );

      const rawMeasurementSpec = {
        nameMatcherType: formNameMatcherType,
        nameMatcher: formNameMatcher,
      };
      if (formUnit === customPseudoUnit) {
        rawMeasurementSpec.unit = `${timeSeriesCustomUnitPrefix}${formCustomUnit}`;
      } else {
        rawMeasurementSpec.unit = formUnit;
      }

      return rawMeasurementSpec;
    });
  return { specs };
}

/**
 * @param {AtmTimeSeriesMeasurementDataSpec} atmDataSpec
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in a form
 */
function atmDataSpecParamsToFormValues(atmDataSpec) {
  const __fieldsValueNames = [];
  const values = createValuesContainer({
    __fieldsValueNames,
  });

  if (!Array.isArray(atmDataSpec?.specs)) {
    return values;
  }

  atmDataSpec.specs.forEach((rawMeasurementSpec, idx) => {
    if (!rawMeasurementSpec) {
      return;
    }

    const formGroupName = `spec${idx}`;

    const {
      nameMatcherType,
      nameMatcher,
      unit,
    } = rawMeasurementSpec;

    const measurementSpecValue = {
      nameMatcherType,
      nameMatcher,
    };

    if (unit.startsWith(timeSeriesCustomUnitPrefix)) {
      measurementSpecValue.unit = customPseudoUnit;
      measurementSpecValue.customUnit = unit.slice(timeSeriesCustomUnitPrefix.length);
    } else {
      measurementSpecValue.unit = unit;
    }

    set(values, formGroupName, createValuesContainer(measurementSpecValue));
    __fieldsValueNames.push(formGroupName);
  });

  return values;
}

/**
 * @param {Ember.Service} i18n
 * @param {Utils.FormComponent.ValuesContainer} values
 * @returns {SafeString}
 */
function summarizeFormValues(i18n, values) {
  const measurementsCount = values && get(values, '__fieldsValueNames.length') || 0;
  return i18n.t(`${i18nPrefix}.summary`, { measurementsCount });
}

/**
 * @param {Utils.FormComponent.ValuesContainer} values
 * @returns {boolean}
 */
function shouldWarnOnRemove(values) {
  return values && get(values, '__fieldsValueNames.length') > 0;
}

export default {
  FormElement,
  formValuesToAtmDataSpecParams,
  atmDataSpecParamsToFormValues,
  summarizeFormValues,
  shouldWarnOnRemove,
};
