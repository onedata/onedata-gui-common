/**
 * Provides a form element capable of showing, creating and modifying time
 * series measurement data spec value constraints. It also provides two methods
 * for conversion between form values and value constraints in both directions.
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
  nameMatcherTypes,
  customUnit,
  customUnitsPrefix,
  units,
  translateNameMatcherType,
  translateUnit,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/types/time-series-measurement';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

const i18nPrefix = 'utils.atmWorkflow.dataSpecEditor.valueConstraintsEditors.timeSeriesMeasurement';

const FormElement = FormFieldsCollectionGroup.extend({
  classes: 'time-series-measurement-value-constraints-editor boxes-collection-layout',
  isDefaultValueIgnored: false,
  i18nPrefix: `${i18nPrefix}.fields`,
  // Does not take parent fields group translation path into account
  translationPath: '',
  sizeForChildren: 'sm',
  fieldFactoryMethod(uniqueFieldValueName) {
    return FormFieldsGroup.create({
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
            return units.map((unit) => ({
              value: unit,
              label: translateUnit(i18n, unit),
            }));
          }),
        }).create({
          name: 'unit',
          defaultValue: units[0],
        }),
        TextField.extend({
          isVisible: eq('parent.value.unit', raw(customUnit)),
        }).create({
          name: 'customUnit',
        }),
      ],
    });
  },
});

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from time series measurement editor
 * @returns {AtmTimeSeriesMeasurementValueConstraints} value constraints
 */
function formValuesToValueConstraints(values) {
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
      if (formUnit === customUnit) {
        rawMeasurementSpec.unit = `${customUnitsPrefix}${formCustomUnit}`;
      } else {
        rawMeasurementSpec.unit = formUnit;
      }

      return rawMeasurementSpec;
    });
  return { specs };
}

/**
 * @param {AtmTimeSeriesMeasurementValueConstraints} valueConstraints value
 * constraints taken from the raw data spec
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in a form
 */
function valueConstraintsToFormValues(valueConstraints) {
  const __fieldsValueNames = [];
  const values = createValuesContainer({
    __fieldsValueNames,
  });

  if (!valueConstraints || !Array.isArray(valueConstraints.specs)) {
    return values;
  }

  valueConstraints.specs.forEach((rawMeasurementSpec, idx) => {
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

    if (unit.startsWith(customUnitsPrefix)) {
      measurementSpecValue.unit = customUnit;
      measurementSpecValue.customUnit = unit.slice(customUnitsPrefix.length);
    } else {
      measurementSpecValue.unit = unit;
    }

    set(values, formGroupName, createValuesContainer(measurementSpecValue));
    __fieldsValueNames.push(formGroupName);
  });

  return values;
}

function summarizeFormValues(i18n, values) {
  const measurementsCount = values && get(values, '__fieldsValueNames.length') || 0;
  return i18n.t(`${i18nPrefix}.summary`, { measurementsCount });
}

function shouldWarnOnRemove(values) {
  return values && get(values, '__fieldsValueNames.length') > 0;
}

export default {
  FormElement,
  formValuesToValueConstraints,
  valueConstraintsToFormValues,
  summarizeFormValues,
  shouldWarnOnRemove,
};
