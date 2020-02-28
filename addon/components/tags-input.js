/**
 * A tags (tokenizer) input, which allows adding and removing tags. New tags
 * are added through dedicated tags editors which can be specified using
 * tagEditorComponentName property.
 * 
 * @module components/tags-input
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/tags-input';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { later } from '@ember/runloop';
import { computed, observer } from '@ember/object';
import { writable, conditional, not, or } from 'ember-awesome-macros';

/**
 * @typedef {Object} Tag
 * @property {string} label
 * @property {string} [icon]
 */

export default Component.extend({
  layout,
  tagName: 'ul',
  classNames: ['tags-input'],
  classNameBindings: [
    'isCreatingTag:creating-tag',
    'readonly',
    'readonly::form-control',
  ],
  attributeBindings: ['tabindex', 'disabled'],

  /**
   * @public
   * @type {ComputedProperty<number>}
   */
  tabindex: writable(conditional('disabled', -1, 0)),

  /**
   * @public
   * @type {boolean}
   */
  disabled: false,

  /**
   * @public
   * @type {boolean}
   */
  readonly: false,

  /**
   * @public
   * @virtual
   * @type {Array<Tag>}
   */
  tags: computed(() => []),

  /**
   * @public
   * @type {Array<String>}
   */
  tagEditorComponentName: 'tags-input/text-editor',

  /**
   * Value passed to the tag editor component through `settings` property.
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
   * @type {boolan}
   */
  isCreatingTag: false,

  /**
   * @type {ComputedProperty<boolean>}
   */
  allowModification: not(or('readonly', 'disabled')),

  allowModificationObserver: observer(
    'allowModification',
    function allowModificationObserver() {
      if (!this.get('allowModification')) {
        this.endTagCreation();
      }
    }
  ),

  click(event) {
    this._super(...arguments);

    if (event.target === this.get('element')) {
      this.startTagCreation()
    }
  },

  keyDown(event) {
    if ([13, 32].includes(event.keyCode) && !this.get('isCreatingTag')) {
      this.startTagCreation()
    }
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
    const {
      isCreatingTag,
      allowModification,
    } = this.getProperties('isCreatingTag', 'allowModification');

    if (allowModification && !isCreatingTag) {
      this.set('isCreatingTag', true);
    }
  },

  endTagCreation() {
    this.set('isCreatingTag', false);
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
        // Focus editor - send focus to the root element of the editor and
        // let the editor to handle that focus on its own
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
      } = this.getProperties('onChange', 'tags');

      onChange((tags || []).concat(newTagsToAdd).uniq());
    },
  }
});
