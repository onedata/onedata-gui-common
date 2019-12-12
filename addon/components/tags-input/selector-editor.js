import Component from '@ember/component';
import layout from '../../templates/components/tags-input/selector-editor';
import { computed, observer, get } from '@ember/object';
import { or } from 'ember-awesome-macros';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend({
  layout,
  classNames: ['tags-input-selector-editor'],

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
   * @type {ComputedProperty<Array<Tag>>}
   */
  allowedTags: or('settings.allowedTags', []),

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  tagsToSelect: computed(
    'allowedTags.@each.label',
    'selectedTags.@each.label',
    function tagsToSelect() {
      const {
        allowedTags,
        selectedTags,
      } = this.getProperties('allowedTags', 'selectedTags');

      const selectedTagsLabels = (selectedTags || []).mapBy('label');
      return allowedTags
        .filter(tag => !selectedTagsLabels.includes(get(tag, 'label')));
    }
  ),

  selectedTagsObserver: observer(
    'selectedTags.@each.label',
    function selectedTagsObserver() {
      if (this.get('tagsToSelect.length')) {
        this.repositionPopover();
      }
    }
  ),

  tagsToSelectObserver: observer(
    'tagsToSelect.length',
    function tagsToSelectObserver() {
      if (!this.get('tagsToSelect.length')) {
        scheduleOnce('afterRender', this, 'onEndTagCreation');
      }
    }
  ),

  init() {
    this._super(...arguments);

    this.tagsToSelectObserver();
  },

  didInsertElement() {
    this._super(...arguments);

    const $parentTagsInput = this.$().parents('.tags-input')
    this.set('parentTagsInputSelector', `#${$parentTagsInput.attr('id')}`)
  },

  repositionPopover() {
    this.get('popoverApi').reposition();
  },

  actions: {
    tagSelected(tag) {
      this.get('onTagsAdded')([tag]);
    },
  },
});
