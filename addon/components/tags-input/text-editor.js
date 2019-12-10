import Component from '@ember/component';
import layout from '../../templates/components/tags-input/text-editor';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { or } from 'ember-awesome-macros';
import $ from 'jquery';

export default Component.extend({
  layout,
  classNames: ['tags-input-text-editor'],

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
  newTags: Object.freeze([]),

  /**
   * @public
   * @virtual
   * @type {Function}
   * @param {Array<Tag>} newTags
   * @returns {any}
   */
  onTagsChanged: notImplementedIgnore,

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
   * @type {ComputedProperty<Array<String>>}
   */
  separators: or('settings.separators', [',']),

  /**
   * @type {ComputedProperty<RegExp>}
   */
  regexp: or('settings.regexp', /^.*$/),

  /**
   * @type {ComputedProperty<String>}
   */
  inputValue: reads('newTags.firstObject.label'),

  focusIn(event) {
    if (!$(event.target).hasClass('text-editor-input')) {
      // Redirect component focus to text input
      this.$('.text-editor-input').focus();
    }
  },

  didInsertElement() {
    this._super(...arguments);

    this.$('.text-editor-input').focus();
  },

  extractTagsLabels(value) {
    const separators = this.get('separators');
    const trimmedValue = value.trim();

    let labels = [trimmedValue];
    for (let separator of separators) {
      const newLabels = [];
      for (let label of labels) {
        newLabels.push(...label
          .split(separator)
          .map(s => s.trim())
          .without('')
        );
      }
      labels = newLabels;
    }

    if (separators.any(separator => trimmedValue.endsWith(separator))) {
      labels.push('');
    }

    return labels;
  },

  actions: {
    inputChanged(value) {
      const {
        onTagsChanged,
        onTagsAdded,
        regexp,
      } = this.getProperties('onTagsChanged', 'onTagsAdded', 'regexp');

      const labels = this.extractTagsLabels(value);
      const lastLabel = get(labels, 'lastObject');

      const tagsToAdd = labels
        .slice(0, -1)
        .filter(label => regexp.test(label))
        .map(label => ({ label }));
      let tagsChanged = [];
      if (lastLabel) {
        const changedTag = { label: lastLabel };
        if (!regexp.test(lastLabel)) {
          changedTag.isInvalid = true;
        }
        tagsChanged.push(changedTag);
      }

      if (tagsToAdd.length) {
        onTagsAdded(tagsToAdd);
      }
      onTagsChanged(tagsChanged);

      if (!lastLabel) {
        // When input was empty and after filling it in with string "sthsth,"
        // it again becomes empty, then ember does not clean the input value
        // because `newTags.firstObject.label` (input value) was empty all the time.
        this.$('.text-editor-input').val('');
      }
    },
    addTags() {
      const {
        newTags,
        onTagsAdded,
      } = this.getProperties('newTags', 'onTagsAdded');

      if (newTags && newTags.length && !newTags[0].isInvalid) {
        onTagsAdded([newTags[0]]);
      }
    },
    focusLost() {
      const {
        inputValue,
        onEndTagCreation,
      } = this.getProperties('inputValue', 'onEndTagCreation');

      if (!inputValue) {
        onEndTagCreation();
      }
    },
  },
});
