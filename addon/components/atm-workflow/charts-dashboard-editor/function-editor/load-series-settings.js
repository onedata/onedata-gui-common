import { set, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { hash } from 'ember-awesome-macros';
import { validator } from 'ember-cp-validations';
import _ from 'lodash';
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
  mainForm: computed(function form() {
    return MainForm.create({
      component: this,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  replaceEmptyForm: computed(function form() {
    return ReplaceEmptySettingsForm.create({
      component: this,
    });
  }),

  formValuesUpdater: observer(
    'chartFunction.{timeSeriesRef.collectionRef,timeSeriesRef.timeSeriesNameGenerator,timeSeriesRef.timeSeriesName,timeSeriesRef.metricNames,replaceEmptyParameters.strategy,replaceEmptyParameters.fallbackValue}',
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
        if (this.replaceEmptyForm.getFieldByPath('fallbackValue').isValid) {
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

    const action = this.actionsFactory.createChangeElementPropertyAction({
      element: this.chartFunction,
      propertyName,
      newValue: normalizedValue,
      changeType,
    });
    action.execute();
  },

  updateFormValues() {
    ['collectionRef', 'timeSeriesNameGenerator', 'timeSeriesName'].forEach((propName) => {
      const newValue = this.chartFunction?.timeSeriesRef?.[propName] ?? '';
      if (newValue !== this.mainForm.valuesSource[propName]) {
        set(this.mainForm.valuesSource, propName, newValue);
      }
    });

    const newMetricNames = this.chartFunction?.timeSeriesRef?.metricNames ?? [];
    if (!_.isEqual(newMetricNames, this.mainForm.valuesSource.metricNames)) {
      set(this.mainForm.valuesSource, 'metricNames', newMetricNames);
    }

    this.mainForm.invalidFields.forEach((field) => field.markAsModified());

    const newFallbackValue = this.chartFunction?.replaceEmptyParameters?.fallbackValue ?? '';
    if (newFallbackValue !== this.replaceEmptyForm.valuesSource.fallbackValue) {
      set(this.replaceEmptyForm.valuesSource, 'fallbackValue', newFallbackValue);
    }

    const newUsePreviousStrategy =
      this.chartFunction?.replaceEmptyParameters?.strategy ===
      ReplaceEmptyStrategy.UsePrevious;
    if (
      newUsePreviousStrategy !== this.replaceEmptyForm.valuesSource.usePreviousStrategy
    ) {
      set(this.replaceEmptyForm.valuesSource, 'usePreviousStrategy', newUsePreviousStrategy);
    }

    this.replaceEmptyForm.invalidFields.forEach((field) => field.markAsModified());
  },
});

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
    return this.parent.dataSources?.map(({ name, collectionRef }) => ({
      label: name,
      value: collectionRef,
    })) ?? [];
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
  options: computed(
    'parent.dataSources',
    'valuesSource.collectionRef',
    function options() {
      const timeSeriesSchemas = this.parent.dataSources.find(({ collectionRef }) =>
        collectionRef === this.valuesSource?.collectionRef
      )?.timeSeriesCollectionSchema.timeSeriesSchemas ?? [];
      return timeSeriesSchemas.map(({ nameGeneratorType, nameGenerator }) => ({
        value: nameGenerator,
        label: `${translateTimeSeriesNameGeneratorType(this.i18n, nameGeneratorType)} "${nameGenerator}"`,
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
  isEnabled: computed('parent.selectedNameGeneratorSpec', function isEnabled() {
    return this.parent.selectedNameGeneratorSpec?.nameGeneratorType !== 'exact';
  }),

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
    validator(function (value, options, model) {
      const selectedNameGeneratorSpec = model.field.parent.selectedNameGeneratorSpec;
      if (selectedNameGeneratorSpec?.nameGeneratorType !== 'addPrefix') {
        return true;
      }
      return (value || '').startsWith(selectedNameGeneratorSpec?.nameGenerator) &&
        value.length > selectedNameGeneratorSpec?.nameGenerator.length;
    }, {
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

/**
 * @type {Utils.FormComponent.FormFieldsRootGroup}
 */
const MainForm = SettingsForm.extend({
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
   * @type {ComputedProperty<Array<ChartsDashboardEditorDataSource>>}
   */
  dataSources: reads('component.chartFunction.dataSources'),

  /**
   * @type {ComputedProperty<TimeSeriesSchema | null>}
   */
  selectedNameGeneratorSpec: computed(
    'dataSources',
    'valuesSource.{collectionRef,timeSeriesNameGenerator}',
    function timeSeriesNameGeneratorSpec() {
      const timeSeriesSchemas = this.dataSources.find(({ collectionRef }) =>
        collectionRef === this.valuesSource?.collectionRef
      )?.timeSeriesCollectionSchema.timeSeriesSchemas ?? [];
      return timeSeriesSchemas.find(({ nameGenerator }) =>
        nameGenerator === this.valuesSource?.timeSeriesNameGenerator
      ) ?? null;
    }
  ),
});
