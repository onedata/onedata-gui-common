import Component from '@ember/component';
import layout from '../templates/components/tags-input';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { later } from '@ember/runloop';

/**
 * @typedef {Object} Tag
 * @property {string} label
 * @property {string} [icon]
 */

export default Component.extend({
  layout,
  tagName: 'ul',
  classNames: ['tags-input', 'form-control'],
  classNameBindings: ['isCreatingTag:creating-tag'],
  attributeBindings: ['tabindex'],

  tabindex: 0,

  /**
   * @public
   * @virtual
   * @type {Array<Tag>}
   */
  tags: Object.freeze([]),

  /**
   * @public
   * @type {Array<String>}
   */
  tagEditorComponentName: 'tags-input/text-editor',

  /**
   * @public
   * @type {any}
   */
  tagEditorSettings: undefined,

  /**
   * @public
   * @virtual
   * @type {Function}
   * @param {Array<Tag>} tags new array of tags
   * @returns {any}
   */
  onChange: notImplementedIgnore,

  /**
   * @public
   * @virtual
   * @type {Function}
   * @returns {any}
   */
  onFocusLost: notImplementedIgnore,

  /**
   * @type {Array<any>}
   */
  newTags: Object.freeze([]),

  /**
   * @type {boolan}
   */
  isCreatingTag: false,

  focusIn() {
    this._super(...arguments);

    this.startTagCreation();
  },

  focusOut() {
    this._super(...arguments);

    later(this, () => {
      if (!this.$().is(':focus') && !this.$(':focus').length) {
        this.get('onFocusLost')();
      }
    }, 0);
  },

  startTagCreation() {
    this.set('isCreatingTag', true);
  },

  endTagCreation() {
    this.setProperties({
      isCreatingTag: false,
      newTags: [],
    });
  },

  actions: {
    removeTag(tag) {
      const {
        onChange,
        tags,
      } = this.getProperties('onChange', 'tags');

      onChange(tags.without(tag));
    },
    startTagCreation() {
      if (this.get('isCreatingTag')) {
        this.send('newTagsAdded', this.get('newTags'));

        // Focus editor
        const event = document.createEvent("Event");
        event.initEvent('focus', true, true);
        this.$('.tag-creator > *')[0].dispatchEvent(event);
      } else {
        this.startTagCreation();
      }
    },
    endTagCreation() {
      this.endTagCreation();
    },
    newTagsAdded(newTagsToAdd) {
      const {
        onChange,
        tags,
        newTags,
      } = this.getProperties('onChange', 'tags', 'newTags');

      const correctTagsToAdd = newTagsToAdd.rejectBy('isInvalid');
      this.set('newTags', newTags.filter(tag => !correctTagsToAdd.includes(tag)));
      onChange(tags.concat(correctTagsToAdd).uniq());
    },
    newTagsChanged(newTags) {
      this.set('newTags', newTags);
    },
  }
});
