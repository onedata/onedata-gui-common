/**
 * "loadSeries" function settings component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { hash, array, raw, eq, bool, not } from 'ember-awesome-macros';
import { validator } from 'ember-cp-validations';
import _ from 'lodash';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TagsField from 'onedata-gui-common/utils/form-component/tags-field';
import FunctionSettingsBase, { SettingsForm } from './function-settings-base';
import { Form as ReplaceEmptySettingsForm } from './replace-empty-settings';
import { ReplaceEmptyStrategy } from 'onedata-gui-common/utils/time-series-dashboard';
import { translateTimeSeriesNameGeneratorType } from 'onedata-gui-common/utils/time-series';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/function-editor/load-series-settings';

export default FunctionSettingsBase.extend({
  layout,

  /**
   * @type {boolean}
   */
  isReplaceEmptyFormVisible: false,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  mainForm: computed(function mainForm() {
    return MainForm.create({
      component: this,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  replaceEmptyFuncForm: computed(function replaceEmptyFuncForm() {
    return ReplaceEmptySettingsForm.create({
      component: this,
    });
  }),

  /**
   * @type {ComputedProperty<TimeSeriesRef>}
   */
  timeSeriesRef: reads('chartFunction.timeSeriesRef'),

  /**
   * @type {ComputedProperty<ReplaceEmptyParameters>}
   */
  replaceEmptyParameters: reads('chartFunction.replaceEmptyParameters'),

  formValuesUpdater: observer(
    'chartFunction.defaultDataSource',
    'timeSeriesRef.{collectionRef,timeSeriesNameGenerator,timeSeriesName,metricNames}',
    'replaceEmptyParameters{strategy,fallbackValue}',
    function formValuesUpdater() {
      scheduleOnce('afterRender', this, 'updateFormValues');
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
    let propertyName = fieldName;
    let normalizedValue = value;
    let changeType = 'discrete';

    switch (fieldName) {
      case 'fallbackValue':
        propertyName = `replaceEmptyParameters.${propertyName}`;
        if (this.replaceEmptyFuncForm.getFieldByPath('fallbackValue').isValid) {
          normalizedValue = value === '' ? null : Number.parseFloat(value);
        }
        changeType = 'continuous';
        break;
      case 'usePreviousStrategy':
        propertyName = 'replaceEmptyParameters.strategy';
        normalizedValue =
          value ? ReplaceEmptyStrategy.UsePrevious : ReplaceEmptyStrategy.UseFallback;
        break;
      case 'timeSeriesName':
        propertyName = 'timeSeriesRef.timeSeriesName';
        changeType = 'continuous';
        break;
      default:
        propertyName = `timeSeriesRef.${fieldName}`;
        break;
    }

    const action = this.editorContext.actionsFactory.createChangeElementPropertyAction({
      element: this.chartFunction,
      propertyName,
      newValue: normalizedValue,
      changeType,
    });
    action.execute();
  },

  updateFormValues() {
    updateTimeSeriesSelectorFormValues(
      this.mainForm.valuesSource.timeSeriesSelector,
      this.chartFunction?.timeSeriesRef
    );

    this.mainForm.invalidFields.forEach((field) => field.markAsModified());

    const newFallbackValue = this.chartFunction?.replaceEmptyParameters?.fallbackValue ?? '';
    if (newFallbackValue !== this.replaceEmptyFuncForm.valuesSource.fallbackValue) {
      set(this.replaceEmptyFuncForm.valuesSource, 'fallbackValue', newFallbackValue);
    }

    const newUsePreviousStrategy =
      this.chartFunction?.replaceEmptyParameters?.strategy ===
      ReplaceEmptyStrategy.UsePrevious;
    if (
      newUsePreviousStrategy !==
      this.replaceEmptyFuncForm.valuesSource.usePreviousStrategy
    ) {
      set(this.replaceEmptyFuncForm.valuesSource, 'usePreviousStrategy', newUsePreviousStrategy);
    }

    this.replaceEmptyFuncForm.invalidFields.forEach((field) => field.markAsModified());
  },
});

export function updateTimeSeriesSelectorFormValues(
  valuesSource,
  timeSeriesRef
) {
  ['collectionRef', 'timeSeriesNameGenerator', 'timeSeriesName'].forEach((propName) => {
    const newValue = timeSeriesRef?.[propName] ?? '';
    if (newValue !== valuesSource[propName]) {
      set(valuesSource, propName, newValue);
    }
  });

  const newMetricNames = timeSeriesRef?.metricNames ?? [];
  if (!_.isEqual(
      newMetricNames,
      valuesSource.metricNames
    )) {
    set(valuesSource, 'metricNames', newMetricNames);
  }
}

/**
 * @type {Utils.FormComponent.DropdownField}
 */
const CollectionRefField = DropdownField.extend({
  /**
   * @override
   */
  name: 'collectionRef',

  /**
   * @override
   */
  options: computed('parent.dataSources', function options() {
    return this.parent.dataSources?.map(({ originName, collectionRef }) => {
      const originType = collectionRef.split('-')[0] ?? 'unknown';

      return {
        label: this.getTranslation(`sourceLabels.${originType}`, { originName }, {
          defaultValue: this.getTranslation('sourceLabels.unknown'),
        }),
        value: collectionRef,
      };
    }) ?? [];
  }),
});

/**
 * @type {Utils.FormComponent.DropdownField}
 */
const TimeSeriesNameGeneratorField = DropdownField.extend({
  /**
   * @override
   */
  name: 'timeSeriesNameGenerator',

  /**
   * @override
   */
  isEnabled: reads('parent.collectionRefField.isValid'),

  /**
   * @override
   */
  options: computed(
    'parent.{dataSources,allowPrefixedTimeSeriesOnly,collectionRefField.value}',
    function options() {
      const timeSeriesSchemas = this.parent.dataSources.find(({ collectionRef }) =>
        collectionRef === this.parent.collectionRefField.value
      )?.timeSeriesCollectionSchema.timeSeriesSchemas ?? [];
      return timeSeriesSchemas
        .map(({ nameGeneratorType, nameGenerator }) => ({
          value: nameGenerator,
          label: `${translateTimeSeriesNameGeneratorType(this.i18n, nameGeneratorType)} "${nameGenerator}"`,
          disabled: this.parent.allowPrefixedTimeSeriesOnly &&
            nameGeneratorType !== 'addPrefix',
        }));
    }
  ),
});

/**
 * @type {Utils.FormComponent.TextField}
 */
const TimeSeriesNameField = TextField.extend({
  /**
   * @override
   */
  name: 'timeSeriesName',

  /**
   * @override
   */
  isVisible: not('parent.allowPrefixedTimeSeriesOnly'),

  /**
   * @override
   */
  isEnabled: eq('parent.selectedNameGeneratorSpec.nameGeneratorType', raw('addPrefix')),

  /**
   * @override
   */
  placeholder: computed('parent.selectedNameGeneratorSpec', function placeholder() {
    if (this.parent.selectedNameGeneratorSpec?.nameGeneratorType === 'addPrefix') {
      return this.getTranslation(
        'placeholder', {
          nameGenerator: this.parent.selectedNameGeneratorSpec.nameGenerator,
        }
      );
    }
  }),

  /**
   * @override
   */
  customValidators: Object.freeze([
    validator('inline', {
      validate(value, options, model) {
        const selectedNameGeneratorSpec = model.field.parent.selectedNameGeneratorSpec;
        if (selectedNameGeneratorSpec?.nameGeneratorType !== 'addPrefix') {
          return true;
        }
        return (value || '').startsWith(selectedNameGeneratorSpec?.nameGenerator) &&
          value.length > selectedNameGeneratorSpec?.nameGenerator.length;
      },
      dependentKeys: ['model.field.parent.selectedNameGeneratorSpec'],
    }),
  ]),
});

/**
 * @type {Utils.FormComponent.TagsField}
 */
const MetricNamesField = TagsField.extend({
  /**
   * @override
   */
  name: 'metricNames',

  /**
   * @override
   */
  sort: true,

  /**
   * @override
   */
  tagEditorComponentName: 'tags-input/selector-editor',

  /**
   * @override
   */
  isEnabled: bool('parent.selectedNameGeneratorSpec'),

  /**
   * @override
   */
  tagEditorSettings: hash('allowedTags'),

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  allowedTags: computed('parent.selectedNameGeneratorSpec', function allowedTags() {
    return Object.keys(this.parent.selectedNameGeneratorSpec?.metrics || {})
      .map((metricName) => ({
        label: metricName,
        value: metricName,
      }));
  }),
});

export const TimeSeriesSelector = FormFieldsGroup.extend({
  /**
   * @virtual
   * @type {boolean}
   */
  allowPrefixedTimeSeriesOnly: false,

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.functionEditor.loadSeriesSettings.fields.timeSeriesSelector',

  /**
   * Do not take parent fields group translation path into account.
   * @override
   */
  translationPath: '',

  /**
   * @override
   */
  name: 'timeSeriesSelector',

  /**
   * @override
   */
  fields: computed(() => [
    CollectionRefField.create(),
    TimeSeriesNameGeneratorField.create(),
    TimeSeriesNameField.create(),
    MetricNamesField.create(),
  ]),

  /**
   * @type {Utils.FormComponent.DropdownField}
   */
  collectionRefField: array.findBy('fields', raw('name'), raw('collectionRef')),

  /**
   * @type {ComputedProperty<Array<ChartsDashboardEditorDataSource>>}
   */
  dataSources: reads('parent.dataSources'),

  /**
   * @type {ComputedProperty<TimeSeriesSchema | null>}
   */
  selectedNameGeneratorSpec: computed(
    'dataSources',
    'value.{collectionRef,timeSeriesNameGenerator}',
    function selectedNameGeneratorSpec() {
      const timeSeriesSchemas = this.dataSources.find(({ collectionRef }) =>
        collectionRef === this.value?.collectionRef
      )?.timeSeriesCollectionSchema.timeSeriesSchemas ?? [];
      return timeSeriesSchemas.find(({ nameGenerator }) =>
        nameGenerator === this.value?.timeSeriesNameGenerator
      ) ?? null;
    }
  ),
});

/**
 * @type {Utils.FormComponent.FormFieldsRootGroup}
 */
const MainForm = SettingsForm.extend({
  /**
   * @override
   */
  fields: computed(() => [
    TimeSeriesSelector.create(),
  ]),

  /**
   * @type {ComputedProperty<Array<ChartsDashboardEditorDataSource>>}
   */
  dataSources: reads('component.chartFunction.dataSources'),
});
