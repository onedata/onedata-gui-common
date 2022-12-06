// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

/**
 * A tags (tokenizer) input editor, which allows to add tags using selector with
 * model records. Available models are: user, group, oneprovider, service (op and oz),
 * serviceOnepanel (opp and ozp).
 *
 * @module components/tags-input/model-selector-editor
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/tags-input/model-selector-editor';
import EmberObject, {
  computed,
  observer,
  get,
  getProperties,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import { or } from 'ember-awesome-macros';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import { promise, array, raw, isEmpty } from 'ember-awesome-macros';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';

const supportedModels = [
  'user',
  'group',
  'provider',
  'service',
  'serviceOnepanel',
];

/**
 * Removes tags, which are redundant due to existence of "all records" tags.
 * E.g. if "all groups" tag is present in passed array, then all specific-group
 * tags will be removed.
 * @param {Array<Tag>} tags
 * @returns {Array<Tag>}
 */
export function removeExcessiveTags(tags) {
  supportedModels.forEach(model => {
    if (tags.findBy('value.record.representsAll', model)) {
      tags = tags.filter(tag =>
        get(tag, 'value.model') !== model ||
        get(tag, 'value.record.representsAll') ||
        get(tag, 'value.record.serviceType') === 'onezone'
      );
    }
  });
  return tags;
}

// ModelSelectorEditor needs specific tag object to handle record related data.
export const Tag = EmberObject.extend(I18n, OwnerInjector, {
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.tagsInput.modelSelectorEditor',

  /**
   * @type {Object}
   * {
   *   model: String - name of the model type
   *   record: Object - record (of `model` type)
   *   id: String
   * }
   * Only one of `id` and `record` must be present in tag value at the same time.
   */
  value: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  label: computed('value.record.{name,representsAll}', function label() {
    const {
      record,
      id,
    } = getProperties(this.get('value') || {}, 'record', 'id');
    if (record) {
      const {
        name,
        representsAll,
      } = getProperties(record, 'name', 'representsAll');
      return representsAll ? this.t(`allRecord.${representsAll}`) : name;
    } else {
      return `ID: ${id}`;
    }
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  tip: computed('value.record.representsAll', function tip() {
    const representsAll = this.get('value.record.representsAll');
    return representsAll &&
      this.t(`allRecordTip.${representsAll}`, {}, { defaultValue: '' });
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  icon: computed('value.{model,record}', function icon() {
    const {
      model,
      record,
    } = getProperties(this.get('value') || {}, 'model', 'record');
    if (model === 'service') {
      return record && get(record, 'serviceType') === 'onezone' ? 'onezone' : 'provider';
    } else {
      return recordIcons[model];
    }
  }),
});

const modelIcons = {
  user: 'user',
  group: 'groups',
  provider: 'provider',
  service: 'cluster',
  serviceOnepanel: 'onepanel',
};

const recordIcons = {
  user: 'user',
  group: 'group',
  provider: 'provider',
  serviceOnepanel: 'onepanel',
};

export default Component.extend(I18n, {
  layout,
  classNames: ['tags-input-model-selector-editor'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.tagsInput.modelSelectorEditor',

  /**
   * @virtual
   * @type {Object}
   *
   * Supported settings: {
   *   models: Array<Object> - array of models specifications, which should be used
   *     to construct list of record. Order of models in dropdown model selector
   *     will be the same as in this array.
   * }
   * Each model specification is an object: {
   *   name: String, - one of: user, group, provider, service, serviceOnepanel
   *   getRecords: Function - returns a Promise which should resolve to
   *     an array of model records
   * }
   */
  settings: undefined,

  /**
   * @virtual
   * @type {Array<Tag>}
   */
  selectedTags: computed(() => []),

  /**
   * @virtual
   * @type {Function}
   * @param {Array<Tag>} tagsToAdd
   * @returns {any}
   */
  onTagsAdded: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @returns {any}
   */
  onEndTagCreation: notImplementedIgnore,

  /**
   * @type {String}
   */
  parentTagsInputSelector: undefined,

  /**
   * @type {Object}
   */
  popoverApi: undefined,

  /**
   * @type {String} one of: list, byId
   */
  selectedView: 'list',

  /**
   * @type {String}
   */
  recordsFilter: '',

  /**
   * @type {String}
   */
  idToAdd: '',

  /**
   * @type {ComputedProperty<String>}
   */
  trimmedIdToAdd: computed('idToAdd', function trimmedIdToAdd() {
    return this.get('idToAdd').trim();
  }),

  /**
   * @type {ComputedProperty<Object>}
   */
  selectedModelOption: reads('modelOptions.firstObject'),

  /**
   * @type {ComputedProperty<String>}
   */
  selectedModelName: reads('selectedModelOption.modelSpec.name'),

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  modelsSpec: or('settings.models', []),

  /**
   * @type {ComputedProperty<Array<Object>>}
   */
  modelOptions: computed('modelsSpec.[]', function modelOptions() {
    return this.get('modelsSpec').map(modelSpec => {
      const name = get(modelSpec, 'name');
      return {
        label: this.t(`modelTypes.${name}`),
        icon: modelIcons[name],
        modelSpec,
      };
    });
  }),

  /**
   * @type {ComputedProperty<PromiseArray<Object>>}
   */
  recordsProxy: promise.array(computed(
    'selectedModelOption.modelSpec.getRecords',
    'modelsSpec.[]',
    function recordsProxy() {
      const getRecords = this.get('selectedModelOption.modelSpec.getRecords');
      return getRecords ? getRecords() : resolve([]);
    }
  )),

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  allAvailableTags: computed(
    'recordsProxy.@each.name',
    function allAvailableTags() {
      const {
        recordsProxy,
        selectedModelName,
      } = this.getProperties('recordsProxy', 'selectedModelName');
      if (get(recordsProxy, 'isFulfilled') && selectedModelName) {
        const allRecord = {
          representsAll: selectedModelName,
        };
        const records = get(recordsProxy, 'content');
        const onezoneRecord = records.findBy('serviceType', 'onezone');
        return [onezoneRecord, allRecord].compact()
          .concat(records.without(onezoneRecord).sortBy('name'))
          .map(record => Tag.create({
            ownerSource: this,
            value: {
              model: selectedModelName,
              record,
            },
          }));
      } else {
        return [];
      }
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasAllRecordsTagSelected: computed(
    'selectedTags.@each.value',
    'selectedModelName',
    function hasAllRecordsTagSelected() {
      const {
        selectedTags,
        selectedModelName,
      } = this.getProperties('selectedTags', 'selectedModelName');
      return Boolean(
        selectedTags.findBy('value.record.representsAll', selectedModelName)
      );
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  allRecordsTagSelectsOnlySubset: array.includes(
    raw(['service', 'serviceOnepanel']),
    'selectedModelName'
  ),

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  tagsToRender: computed(
    'allAvailableTags.[]',
    'selectedTags.[]',
    'hasAllRecordsTagSelected',
    'allRecordsTagSelectsOnlySubset',
    function tagsToRender() {
      const {
        allAvailableTags,
        selectedTags,
        hasAllRecordsTagSelected,
        allRecordsTagSelectsOnlySubset,
      } = this.getProperties(
        'allAvailableTags',
        'selectedTags',
        'hasAllRecordsTagSelected',
        'allRecordsTagSelectsOnlySubset'
      );
      const selectedValues = selectedTags.mapBy('value').compact();
      let recordsToReturn = allAvailableTags;
      if (hasAllRecordsTagSelected) {
        // Remove "Any" tag
        recordsToReturn = recordsToReturn
          .rejectBy('value.record.representsAll');
        if (allRecordsTagSelectsOnlySubset) {
          // remove oneproviders for types service and serviceOnepanel
          recordsToReturn = recordsToReturn
            .filter(tag => get(tag, 'value.record.serviceType') === 'onezone');
        } else {
          recordsToReturn = [];
        }
      }
      return recordsToReturn
        .reject(tag => selectedValues.filter(selectedValue =>
          get(selectedValue, 'record') === get(tag, 'value.record') &&
          get(selectedValue, 'model') === get(tag, 'value.model')
        ).length > 0);
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isAllRecordsSelectedDescriptionVisible: isEmpty('tagsToRender'),

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  filteredTagsToRender: computed(
    'tagsToRender.each.label',
    'recordsFilter',
    function filteredTagsToRender() {
      const {
        tagsToRender,
        recordsFilter,
      } = this.getProperties('tagsToRender', 'recordsFilter');

      const filter = recordsFilter.trim().toLocaleLowerCase();
      return tagsToRender.filter(tag =>
        String(get(tag, 'label')).trim().toLocaleLowerCase().includes(filter)
      );
    }
  ),

  selectedTagsObserver: observer(
    'selectedTags.@each.label',
    function selectedTagsObserver() {
      this.repositionPopover();
    }
  ),

  didInsertElement() {
    this._super(...arguments);

    const parentTagsInput = this.element.closest('.tags-input');
    if (parentTagsInput) {
      this.set('parentTagsInputSelector', `#${parentTagsInput.id}`);
    }
  },

  repositionPopover() {
    this.get('popoverApi').reposition();
  },

  actions: {
    tagSelected(tag) {
      this.get('onTagsAdded')([tag]);
    },
    addId() {
      const {
        trimmedIdToAdd,
        onTagsAdded,
        selectedModelName,
      } = this.getProperties(
        'trimmedIdToAdd',
        'onTagsAdded',
        'selectedModelName'
      );
      const tag = Tag.create({
        ownerSource: this,
        value: {
          model: selectedModelName,
          id: trimmedIdToAdd,
        },
      });
      this.set('idToAdd', '');
      onTagsAdded([tag]);
    },
  },
});
