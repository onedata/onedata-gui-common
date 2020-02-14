import Component from '@ember/component';
import layout from '../../templates/components/tags-input/model-selector-editor';
import EmberObject, { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { or } from 'ember-awesome-macros';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import { conditional, promise, array, raw, and, not, tag } from 'ember-awesome-macros';

const Tag = EmberObject.extend({
  label: conditional(
    'value.record',
    'value.record.name',
    tag `ID: ${'value.byId.id'}`,
  ),
  value: undefined,
  icon: undefined,
});

const modelIcons = {
  user: 'user',
  group: 'group',
  oneprovider: 'provider',
  service: 'cluster',
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
   * @public
   * @virtual
   * @type {Object}
   */
  settings: undefined,

  /**
   * @public
   * @virtual
   * @type {Array<Tag>}
   */
  selectedTags: computed(() => []),

  /**
   * @public
   * @virtual
   * @type {Function}
   * @param {Array<Tag>} tagsToAdd
   * @returns {any}
   */
  onTagsAdded: notImplementedIgnore,

  /**
   * @public
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

  recordsProxy: promise.object(computed(
    'selectedModelOption.modelSpec.getRecords',
    'modelsSpec.[]',
    function modelRecordsProxy() {
      const getRecords = this.get('selectedModelOption.modelSpec.getRecords');
      return getRecords ? getRecords() : resolve([]);
    }
  )),

  allAvailableTags: computed(
    'recordsProxy.content.@each.name',
    function allAvailableTags() {
      const {
        recordsProxy,
        selectedModelName,
      } = this.getProperties('recordsProxy', 'selectedModelName');
      if (get(recordsProxy, 'isFulfilled') && selectedModelName) {
        const allRecord = {
          name: this.t(`allRecord.${selectedModelName}`),
          representsAll: selectedModelName,
        };
        return [allRecord].concat(get(recordsProxy, 'content').sortBy('name'))
          .map(record => Tag.create({
            value: { record },
            icon: this.getIconForRecord(record, selectedModelName),
          }));
      } else {
        return [];
      }
    }
  ),

  hasAllRecordsTagSelected: computed(
    'selectedTags.@each.value',
    'selectedModelName',
    function hasAllRecordsTagSelected() {
      const {
        selectedTags,
        selectedModelName,
      } = this.getProperties('selectedTags', 'selectedModelName');
      return selectedTags.mapBy('value.record.representsAll')
        .includes(selectedModelName);
    }
  ),

  allRecordsTagSelectsOnlySubset: array.includes(
    raw(['service', 'serviceOnepanel']),
    'selectedModelName'
  ),

  showAllRecordsSelectedDescription: and(
    'hasAllRecordsTagSelected',
    not('allRecordsTagSelectsOnlySubset')
  ),

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
      const selectedRecords = selectedTags.mapBy('value.record').compact();
      let recordsToReturn = allAvailableTags;
      if (hasAllRecordsTagSelected) {
        if (allRecordsTagSelectsOnlySubset) {
          // remove oneproviders for types service and serviceOnepanel
          recordsToReturn = recordsToReturn
            .filter(tag => get(tag, 'value.record.type') === 'onezone');
        } else {
          recordsToReturn = [];
        }
      }
      return recordsToReturn
        .reject(tag => selectedRecords.includes(get(tag, 'value.record')));
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

    const $parentTagsInput = this.$().parents('.tags-input')
    this.set('parentTagsInputSelector', `#${$parentTagsInput.attr('id')}`)
  },

  repositionPopover() {
    this.get('popoverApi').reposition();
  },

  getIconForRecord(record, modelTypeName) {
    if (modelTypeName === 'service') {
      return record && get(record, 'type') === 'onezone' ? 'onezone' : 'provider';
    } else {
      return modelIcons[modelTypeName];
    }
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
      const icon = this.getIconForRecord(null, selectedModelName);
      const tag = Tag.create({
        icon,
        value: {
          byId: {
            id: trimmedIdToAdd,
            model: selectedModelName,
          },
        },
      });
      this.set('idToAdd', '');
      onTagsAdded([tag]);
    },
  },
});
