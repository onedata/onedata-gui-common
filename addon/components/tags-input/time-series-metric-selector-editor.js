/**
 * A tags (tokenizer) input editor, which allows to add tags (metrics) using selector.
 * There are two possibilites to add new tags: time series metric presets and
 * custom metric form.
 *
 * It is forbidden to use the same resolution twice for the same aggregator. Also
 * metric IDs must be unique.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import EmberObject, {
  computed,
  observer,
  get,
  getProperties,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import { tag } from 'ember-awesome-macros';
import { validator } from 'ember-cp-validations';
import layout from '../../templates/components/tags-input/time-series-metric-selector-editor';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import {
  timeSeriesMetricAggregators,
  timeSeriesMetricResolutions,
  timeSeriesMetricResolutionsMap,
  translateTimeSeriesMetricResolution,
  translateTimeSeriesMetricAggregator,
} from 'onedata-gui-common/utils/time-series';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';

/**
 * @typedef {TimeSeriesMetric} TimeSeriesMetricTagsInputValue
 * @property {string} name
 */

const presetDataPerResolution = {
  [timeSeriesMetricResolutionsMap.fiveSeconds]: {
    // 2 hours
    retention: 2 * 60 * 12,
    metricNameResolutionPart: '5s',
  },
  [timeSeriesMetricResolutionsMap.minute]: {
    // 1 day
    retention: 24 * 60,
    metricNameResolutionPart: '1m',
  },
  [timeSeriesMetricResolutionsMap.hour]: {
    // ~2 months
    retention: 2 * 30 * 24,
    metricNameResolutionPart: '1h',
  },
  [timeSeriesMetricResolutionsMap.day]: {
    // ~2 years
    retention: 2 * 12 * 30,
    metricNameResolutionPart: '1d',
  },
  [timeSeriesMetricResolutionsMap.week]: {
    // ~5 years
    retention: 10 * 52,
    metricNameResolutionPart: '1w',
  },
  [timeSeriesMetricResolutionsMap.month]: {
    // ~10 years
    retention: 10 * 12,
    metricNameResolutionPart: '1mo',
  },
  [timeSeriesMetricResolutionsMap.year]: {
    // 10 years
    retention: 10,
    metricNameResolutionPart: '1y',
  },
};

// TimeSeriesMetricEditor needs specific tag object to handle metric related data.
export const Tag = EmberObject.extend(I18n, OwnerInjector, {
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.tagsInput.timeSeriesMetricEditor.tag',

  /**
   * @virtual
   * @type {TimeSeriesMetricTagsInputValue}
   */
  value: undefined,

  /**
   * @virtual optional
   * @type {'equivalentExists'|'nameExists'|null}
   */
  disabledReason: null,

  /**
   * @type {ComputedProperty<string>}
   */
  label: computed('value', function label() {
    const {
      i18n,
      value,
    } = this.getProperties('i18n', 'value');
    const {
      name,
      aggregator,
      resolution,
      retention,
    } = getProperties(
      value || {},
      'name',
      'aggregator',
      'resolution',
      'retention'
    );

    const readableName = name ? `"${name}"` : this.t('unknownName');
    const readableAggregator = timeSeriesMetricAggregators.includes(aggregator) ?
      String(translateTimeSeriesMetricAggregator(i18n, aggregator, { short: true }))
      .toLocaleLowerCase() : '?';
    const readableResolution = timeSeriesMetricResolutions.includes(resolution) ?
      String(translateTimeSeriesMetricResolution(i18n, resolution, { short: true }))
      .toLocaleLowerCase() : '?';
    const readableRetention = Number.isInteger(retention) ?
      this.t('retention', { retention }) : '?';

    return `${readableName} (${readableAggregator}; ${readableResolution}; ${readableRetention})`;
  }),
});

export default Component.extend(I18n, {
  layout,
  classNames: ['tags-input-time-series-metric-selector-editor'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.tagsInput.timeSeriesMetricEditor',

  /**
   * This component does not have any additional settings. `settings` field is
   * defined to provide editor API compatible with the one expected by the
   * tags input.
   * @virtual optional
   * @type {Object}
   */
  settings: undefined,

  /**
   * @virtual
   * @type {Array<Tag>}
   */
  selectedTags: undefined,

  /**
   * @virtual
   * @type {(tagsToAdd: Array<Tag>) => void}
   */
  onTagsAdded: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onEndTagCreation: undefined,

  /**
   * @type {string}
   */
  parentTagsInputSelector: undefined,

  /**
   * @type {Object}
   */
  popoverApi: undefined,

  /**
   * @type {FieldOption}
   */
  selectedAggregatorOption: undefined,

  /**
   * @type {'presets'|'custom'}
   */
  selectedView: 'presets',

  /**
   * @type {ComputedProperty<Array<FieldOption>>}
   */
  aggregatorOptions: computed(function aggregatorOptions() {
    const i18n = this.get('i18n');
    return timeSeriesMetricAggregators.map((aggregator) => {
      return {
        label: translateTimeSeriesMetricAggregator(i18n, aggregator),
        value: aggregator,
      };
    });
  }),

  /**
   * @type {ComputedProperty<Array<TimeSeriesMetricTagsInputValue>>}
   */
  allAvailableTagValues: computed(
    'selectedAggregatorOption.value',
    function allAvailableTagValues() {
      const aggregator = this.get('selectedAggregatorOption.value');
      return timeSeriesMetricResolutions
        .filter((resolution) => resolution in presetDataPerResolution)
        .map((resolution) => {
          return {
            name: generateMetricName(aggregator, resolution),
            aggregator,
            resolution,
            retention: presetDataPerResolution[resolution].retention,
          };
        });
    }
  ),

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  tagsToRender: computed(
    'allAvailableTagValues',
    'selectedTags.[]',
    'usedNames',
    function tagsToRender() {
      const {
        allAvailableTagValues,
        selectedTags,
        usedNames,
      } = this.getProperties('allAvailableTagValues', 'selectedTags', 'usedNames');

      const selectedTagHashes = new Set();
      const selectedTagCompatHashes = new Set();

      (selectedTags || []).forEach((tag) => {
        const tagValue = get(tag, 'value');
        selectedTagHashes.add(getTagValueHash(tagValue));
        selectedTagCompatHashes.add(getTagValueHash(tagValue, true));
      });

      return allAvailableTagValues
        .filter((tagValue) =>
          !selectedTagHashes.has(getTagValueHash(tagValue))
        )
        .map((tagValue) => Tag.create({
          ownerSource: this,
          value: tagValue,
          disabledReason: selectedTagCompatHashes.has(getTagValueHash(tagValue, true)) ?
            'equivalentExists' : (usedNames.has(get(tagValue, 'name')) ? 'nameExists' : null),
        }));
    }
  ),

  /**
   * @type {ComputedProperty<Set<string>>}
   */
  usedNames: computed('selectedTags.[]', function usedNames() {
    return new Set(
      (this.get('selectedTags') || []).map((tag) => get(tag, 'value.name'))
    );
  }),

  /**
   * Set with strings "aggregator-resolution" (e.g. "sum-3600")
   * @type {ComputedProperty<Set<string>>}
   */
  usedResolutions: computed('selectedTags.[]', function usedResolutions() {
    return new Set((this.get('selectedTags') || []).map((tag) =>
      stringifyUsedResolution(get(tag, 'value.aggregator'), get(tag, 'value.resolution'))
    ));
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  customMetricFields: computed(function customMetricFields() {
    return FormFieldsRootGroup.extend({
      i18nPrefix: tag `${'component.i18nPrefix'}.customMetricFields`,
      ownerSource: reads('component'),
    }).create({
      component: this,
      size: 'sm',
      fields: [
        TextField.create({
          component: this,
          name: 'name',
          customValidators: [
            validator('inline', {
              validate(value, options, model) {
                if (!value) {
                  return true;
                }
                const field = get(model, 'field');
                const usedNames = get(field, 'component.usedNames');
                const errorMsg =
                  String(field.t(`${get(field, 'path')}.errors.notUnique`));
                return usedNames.has(value) ? errorMsg : true;
              },
              dependentKeys: ['model.field.component.usedNames'],
            }),
          ],
        }),
        DropdownField.extend({
          options: computed(function options() {
            const i18n = this.get('i18n');
            return timeSeriesMetricResolutions.map((resolution) => ({
              value: resolution,
              label: translateTimeSeriesMetricResolution(i18n, resolution),
            }));
          }),
        }).create({
          component: this,
          name: 'resolution',
          defaultValue: timeSeriesMetricResolutions[0],
          customValidators: [
            validator('inline', {
              validate(value, options, model) {
                if (!value) {
                  return true;
                }
                const field = get(model, 'field');
                const usedResolutions = get(field, 'component.usedResolutions');
                const aggregator = get(field, 'component.selectedAggregatorOption.value');
                const errorMsg =
                  String(field.t(`${get(field, 'path')}.errors.notUnique`));
                return usedResolutions.has(stringifyUsedResolution(aggregator, value)) ?
                  errorMsg : true;
              },
              dependentKeys: [
                'model.field.component.usedResolutions',
                'model.field.component.selectedAggregatorOption.value',
              ],
            }),
          ],
        }),
        NumberField.create({
          name: 'retention',
          gte: 1,
          integer: true,
          defaultValue: '1000',
        }),
      ],
    });
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  popoverClickOutsideIgnoreSelector: computed(
    'parentTagsInputSelector',
    function popoverClickOutsideIgnoreSelector() {
      return `${this.get('parentTagsInputSelector')}, .resolution-field-dropdown`;
    }
  ),

  selectedTagsObserver: observer(
    'selectedTags.[]',
    function selectedTagsObserver() {
      this.repositionPopover();
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    if (!this.selectedTags) {
      this.set('selectedTags', []);
    }
    this.set('selectedAggregatorOption', this.get('aggregatorOptions')[0]);
    // Mark as modified to show selected resolution conflict from the beginning
    this.get('customMetricFields').getFieldByPath('resolution').markAsModified();
  },

  didInsertElement() {
    this._super(...arguments);

    const parentTagsInput = this.get('element').closest('.tags-input');
    if (parentTagsInput) {
      this.set('parentTagsInputSelector', `#${parentTagsInput.id}`);
    }
  },

  repositionPopover() {
    this.get('popoverApi').reposition();
  },

  actions: {
    tagSelected(tag) {
      if (get(tag, 'disabledReason')) {
        return;
      }
      this.get('onTagsAdded')([tag]);
    },
    submitCustomMetric() {
      const aggregator = this.get('selectedAggregatorOption.value');
      const {
        customMetricFields,
        onTagsAdded,
      } = this.getProperties('customMetricFields', 'onTagsAdded');

      if (!get(customMetricFields, 'isValid')) {
        return;
      }

      const customMetricFieldsValues = customMetricFields.dumpValue();
      const {
        name,
        resolution,
        retention,
      } = getProperties(customMetricFieldsValues, 'name', 'resolution', 'retention');

      const newTag = Tag.create({
        ownerSource: this,
        value: {
          name,
          aggregator,
          resolution,
          retention: Number.parseInt(retention),
        },
      });
      onTagsAdded([newTag]);
      customMetricFields.getFieldByPath('name').reset();
    },
  },
});

function generateMetricName(aggregator, resolution) {
  return `${aggregator}${presetDataPerResolution[resolution].metricNameResolutionPart}`;
}

function stringifyUsedResolution(aggregator, resolution) {
  return `${aggregator}-${resolution}`;
}

/**
 * Calculates hash representation of tag value, which is handy for comparison purposes.
 * When `includeOnlyCompatProps` is set to true, only most important and functional fields
 * are hashed to represent "compatibility"-related features instead of all details.
 * @param {TimeSeriesMetricTagsInputValue} tagValue
 * @param {boolean} includeOnlyCompatProps
 * @returns {string}
 */
function getTagValueHash(tagValue, includeOnlyCompatProps = false) {
  const propsToHash = includeOnlyCompatProps ? [
    'aggregator',
    'resolution',
  ] : [
    'name',
    'aggregator',
    'resolution',
    'retention',
  ];
  return propsToHash.map((propName) => (tagValue || {})[propName]).join('|');
}
