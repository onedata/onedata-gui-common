/**
 * A tags (tokenizer) input editor, which allows to add tags (metrics) using selector.
 * There are two possibilites to add new tags: time series metric presets and
 * custom metric form.
 *
 * It is forbidden to use the same resolution twice for the same aggregator. Also
 * metric IDs must be unique.
 *
 * @module components/tags-input/time-series-metric-selector-editor
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import EmberObject, { computed, observer, get, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import { tag } from 'ember-awesome-macros';
import { validator } from 'ember-cp-validations';
import layout from '../../templates/components/tags-input/time-series-metric-selector-editor';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import {
  metricAggregators,
  metricResolutions,
  metricResolutionsMap,
  translateMetricResolution,
  translateMetricAggregator,
} from 'onedata-gui-common/utils/atm-workflow/store-config/time-series';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';

/**
 * @typedef {TimeSeriesMetric} TimeSeriesMetricTagsInputValue
 * @property {string} id
 */

const presetDataPerResolution = {
  [metricResolutionsMap.fiveSeconds]: {
    // 2 hours
    retention: 2 * 60 * 12,
    metricIdResolutionPart: '5s',
  },
  [metricResolutionsMap.minute]: {
    // 1 day
    retention: 24 * 60,
    metricIdResolutionPart: '1m',
  },
  [metricResolutionsMap.hour]: {
    // ~2 months
    retention: 2 * 30 * 24,
    metricIdResolutionPart: '1h',
  },
  [metricResolutionsMap.day]: {
    // ~2 years
    retention: 2 * 12 * 30,
    metricIdResolutionPart: '1d',
  },
  [metricResolutionsMap.week]: {
    // ~5 years
    retention: 10 * 52,
    metricIdResolutionPart: '1w',
  },
  [metricResolutionsMap.month]: {
    // ~10 years
    retention: 10 * 12,
    metricIdResolutionPart: '1mo',
  },
  [metricResolutionsMap.year]: {
    // 10 years
    retention: 10,
    metricIdResolutionPart: '1y',
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
   * @type {'equivalentExists'|'idExists'|null}
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
      id,
      aggregator,
      resolution,
      retention,
    } = getProperties(
      value || {},
      'id',
      'aggregator',
      'resolution',
      'retention'
    );

    const readableId = id ? `"${id}"` : this.t('unknownId');
    const readableAggregator = metricAggregators.includes(aggregator) ?
      String(translateMetricAggregator(i18n, aggregator, { short: true })).toLocaleLowerCase() :
      '?';
    const readableResolution = metricResolutions.includes(resolution) ?
      String(translateMetricResolution(i18n, resolution, { short: true })).toLocaleLowerCase() :
      '?';
    const readableRetention = Number.isInteger(retention) ?
      this.t('retention', { retention }) : '?';

    return `${readableId} (${readableAggregator}; ${readableResolution}; ${readableRetention})`;
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
  selectedTags: computed(() => []),

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
    return metricAggregators.map((aggregator) => {
      return {
        label: translateMetricAggregator(i18n, aggregator),
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

      return metricResolutions
        .filter((resolution) => resolution in presetDataPerResolution)
        .map((resolution) => {
          return {
            id: generateMetricId(aggregator, resolution),
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
    'usedIds',
    function tagsToRender() {
      const {
        allAvailableTagValues,
        selectedTags,
        usedIds,
      } = this.getProperties('allAvailableTagValues', 'selectedTags', 'usedIds');

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
            'equivalentExists' : (usedIds.has(get(tagValue, 'id')) ? 'idExists' : null),
        }));
    }
  ),

  /**
   * @type {ComputedProperty<Set<string>>}
   */
  usedIds: computed('selectedTags.[]', function usedIds() {
    return new Set(
      (this.get('selectedTags') || []).map((tag) => get(tag, 'value.id'))
    );
  }),

  /**
   * Set with strings "aggregator-resolution" (e.g. "sum-3600")
   * @type {ComputedProperty<Set<string>>}
   */
  usedResolutions: computed('selectedTags.[]', function usedResolutions() {
    return new Set((this.get('selectedTags') || []).map((tag) =>
      `${get(tag, 'value.aggregator')}-${get(tag, 'value.resolution')}`
    ));
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    return FormFieldsRootGroup.extend({
      i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
      ownerSource: reads('component'),
    }).create({
      component: this,
      size: 'sm',
      fields: [
        TextField.create({
          component: this,
          name: 'id',
          customValidators: [
            validator(function (value, options, model) {
              if (!value) {
                return true;
              }
              const field = get(model, 'field');
              const usedIds = get(field, 'component.usedIds');
              const errorMsg =
                String(field.t(`${get(field, 'path')}.errors.notUnique`));
              return usedIds.has(value) ? errorMsg : true;
            }, {
              dependentKeys: ['model.field.component.usedIds'],
            }),
          ],
        }),
        DropdownField.extend({
          options: computed(function options() {
            const i18n = this.get('i18n');
            return metricResolutions.map((resolution) => ({
              value: resolution,
              label: translateMetricResolution(i18n, resolution),
            }));
          }),
        }).create({
          component: this,
          name: 'resolution',
          defaultValue: metricResolutions[0],
          customValidators: [
            validator(function (value, options, model) {
              if (!value) {
                return true;
              }
              const field = get(model, 'field');
              const usedResolutions = get(field, 'component.usedResolutions');
              const aggregator = get(field, 'component.selectedAggregatorOption.value');
              const errorMsg =
                String(field.t(`${get(field, 'path')}.errors.notUnique`));
              return usedResolutions.has(`${aggregator}-${value}`) ? errorMsg : true;
            }, {
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

  init() {
    this._super(...arguments);
    this.set('selectedAggregatorOption', this.get('aggregatorOptions')[0]);
    // Mark as modified to show selected resolution conflict from the beginning
    this.get('fields').getFieldByPath('resolution').markAsModified();
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
        fields,
        onTagsAdded,
      } = this.getProperties('fields', 'onTagsAdded');

      if (!get(fields, 'isValid')) {
        return;
      }

      const fieldsValues = fields.dumpValue();
      const {
        id,
        resolution,
        retention,
      } = getProperties(fieldsValues, 'id', 'resolution', 'retention');

      const newTag = Tag.create({
        ownerSource: this,
        value: {
          id,
          aggregator,
          resolution,
          retention: Number.parseInt(retention),
        },
      });
      onTagsAdded([newTag]);
      fields.getFieldByPath('id').reset();
    },
  },
});

function generateMetricId(aggregator, resolution) {
  return `${aggregator}${presetDataPerResolution[resolution].metricIdResolutionPart}`;
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
    'id',
    'aggregator',
    'resolution',
    'retention',
  ];
  return propsToHash.map((propName) => (tagValue || {})[propName]).join('|');
}
