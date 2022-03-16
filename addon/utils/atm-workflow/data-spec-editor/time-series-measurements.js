import { set, get, getProperties, computed } from '@ember/object';
import { eq, raw } from 'ember-awesome-macros';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import {
  customUnit,
  customUnitsPrefix,
  units,
} from 'onedata-gui-common/utils/atm-workflow/data-spec/time-series-measurements';
import ValuesContainer from 'onedata-gui-common/utils/form-component/values-container';

const FieldsGroup = FormFieldsCollectionGroup.extend({
  isDefaultValueIgnored: false,
  fieldFactoryMethod(uniqueFieldValueName) {
    return FormFieldsGroup.create({
      name: 'measurementSpec',
      valueName: uniqueFieldValueName,
      fields: [
        DropdownField.extend({
          options: computed(function options() {
            const i18n = this.get('i18n');
            return ['exact', 'hasPrefix'].map((nameMatcherType) => ({
              value: nameMatcherType,
              label: translateNameMatcherType(i18n, nameMatcherType),
            }));
          }),
        }).create({
          name: 'nameMatcherType',
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
 * @param {Utils.FormComponent.ValuesContainer} values Values from time series measurements editor
 * @returns {Object} value constraints
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
 *
 * @param {Object} valueConstraints value constraints taken from the raw data spec
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in a form
 */
function valueConstraintsToFormValues(valueConstraints) {
  const __fieldsValueNames = [];
  const values = ValuesContainer.create({
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

    set(values, formGroupName, ValuesContainer.create(measurementSpecValue));
    __fieldsValueNames.push(formGroupName);
  });

  return values;
}

export default {
  fieldsGroup: FieldsGroup,
  formValuesToValueConstraints,
  valueConstraintsToFormValues,
};

function translateNameMatcherType(i18n, nameMatcherType) {
  return i18n.t(`utils.atmWorkflow.dataSpec.timeSeriesMeasurements.nameMatcherTypes.${nameMatcherType}`);
}

function translateUnit(i18n, unit) {
  return i18n.t(`utils.atmWorkflow.dataSpec.timeSeriesMeasurements.units.${unit}`);
}
