import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import EmberObject, { computed, observer, get, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import { tag } from 'ember-awesome-macros';
import layout from '../../templates/components/tags-input/time-series-metric-selector-editor';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import {
  metricAggregators,
  metricResolutions,
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
  fiveSeconds: {
    // 2 hours
    retention: 2 * 60 * 12,
    metricIdResolutionPart: '5s',
  },
  minute: {
    // 1 day
    retention: 24 * 60,
    metricIdResolutionPart: '1m',
  },
  hour: {
    // ~2 months
    retention: 2 * 30 * 24,
    metricIdResolutionPart: '1h',
  },
  day: {
    // ~2 years
    retention: 2 * 12 * 30,
    metricIdResolutionPart: '1d',
  },
  week: {
    // ~5 years
    retention: 10 * 52,
    metricIdResolutionPart: '1w',
  },
  month: {
    // ~10 years
    retention: 10 * 12,
    metricIdResolutionPart: '1mo',
  },
  year: {
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
   * @type {boolean}
   */
  isEquivalentAlreadySelected: false,

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
    const resolutionName = (metricResolutions.findBy('resolution', resolution) || {}).name;

    const readableId = id ? `"${id}"` : this.t('unknownId');
    const readableAggregator = metricAggregators.includes(aggregator) ?
      String(translateMetricAggregator(i18n, aggregator, { short: true })).toLocaleLowerCase() :
      '?';
    const readableResolution = resolutionName ?
      String(translateMetricResolution(i18n, resolutionName, { short: true })).toLocaleLowerCase() :
      '?';
    const readableRetention = Number.isInteger(retention) ?
      this.t('retention', { retention }) : '?';

    return `${readableId} (${readableAggregator}; ${readableResolution}; ${readableRetention})`;
  }),
});

export default Component.extend(I18n, {
  layout,
  classNames: ['tags-input-time-series-metric-selector-editor'],

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
        .filter(({ name }) => name in presetDataPerResolution)
        .map(({ name: resolutionName, resolution }) => ({
          id: generateMetricId(aggregator, resolutionName),
          aggregator,
          resolution,
          retention: presetDataPerResolution[resolutionName].retention,
        }));
    }
  ),

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  tagsToRender: computed(
    'allAvailableTagValues',
    'selectedTags.[]',
    function tagsToRender() {
      const {
        allAvailableTagValues,
        selectedTags,
      } = this.getProperties('allAvailableTagValues', 'selectedTags');

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
          isEquivalentAlreadySelected: selectedTagCompatHashes.has(getTagValueHash(tagValue, true)),
        }));
    }
  ),

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
          name: 'id',
        }),
        DropdownField.extend({
          options: computed(function options() {
            const i18n = this.get('i18n');
            return metricResolutions.map(({ name, resolution }) => ({
              value: resolution,
              label: translateMetricResolution(i18n, name),
            }));
          }),
        }).create({
          name: 'resolution',
          defaultValue: metricResolutions[0].resolution,
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

  selectedTagsObserver: observer(
    'selectedTags.[]',
    function selectedTagsObserver() {
      this.repositionPopover();
    }
  ),

  init() {
    this._super(...arguments);
    this.set('selectedAggregatorOption', this.get('aggregatorOptions')[0]);
  },

  didInsertElement() {
    this._super(...arguments);

    const parentTagsInput = this.get('element').closest('.tags-input');
    this.set('parentTagsInputSelector', `#${parentTagsInput.id}`);
  },

  repositionPopover() {
    this.get('popoverApi').reposition();
  },

  actions: {
    tagSelected(tag) {
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
    },
  },
});

function generateMetricId(aggregator, resolutionName) {
  return `${aggregator}${presetDataPerResolution[resolutionName].metricIdResolutionPart}`;
}

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
