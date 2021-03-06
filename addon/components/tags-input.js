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
import { computed, observer, get, getProperties } from '@ember/object';
import { writable, conditional, not, or } from 'ember-awesome-macros';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import config from 'ember-get-config';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

/**
 * @typedef {Object} Tag
 * @property {string} label
 * @property {string} [icon]
 */

export default Component.extend(I18n, {
  layout,
  tagName: 'ul',
  classNames: ['tags-input'],
  classNameBindings: [
    'isCreatingTag:creating-tag',
    'readonly',
    'readonly::form-control',
    'readonly::clickable',
  ],
  attributeBindings: ['tabindex', 'disabled'],

  i18n: service(),

  /**
   * @override
   */
  touchActionProperties: '',

  /**
   * @override
   */
  i18nPrefix: 'components.tagsInput',

  /**
   * @virtual optional
   * @type {ComputedProperty<number>}
   */
  tabindex: writable(conditional('disabled', -1, 0)),

  /**
   * @virtual optional
   * @type {boolean}
   */
  disabled: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  readonly: false,

  /**
   * @virtual
   * @type {Array<Tag>}
   */
  tags: computed(() => []),

  /**
   * If provided, limits number of tags. When the number of existing tags
   * is greater than or equal to the limit, then creating new tags
   * becomes disabled.
   * @virtual optional
   * @type {Number}
   */
  tagsLimit: undefined,

  /**
   * @virtual optional
   * @type {Array<String>}
   */
  tagEditorComponentName: 'tags-input/text-editor',

  /**
   * Value passed to the tag editor component through `settings` property.
   * @virtual optional
   * @type {any}
   */
  tagEditorSettings: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Array<Tag>} tags new array of tags
   * @returns {any}
   */
  onChange: notImplementedIgnore,

  /**
   * @virtual optional
   * @type {Function}
   * @returns {any}
   */
  onFocusLost: notImplementedIgnore,

  /**
   * @type {boolan}
   */
  isCreatingTag: false,

  /**
   * @type {ComputedProperty<Boolean>}
   */
  allowModification: not(or('readonly', 'disabled')),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  creationDisabledReason: computed('tags.length', 'tagsLimit', function allowCreation() {
    const {
      tags,
      tagsLimit,
    } = this.getProperties('tags', 'tagsLimit');

    if (Number.isInteger(tagsLimit) && tagsLimit <= get(tags || [], 'length')) {
      return 'limitReached';
    }
  }),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  allowCreation: not('creationDisabledReason'),

  /**
   * @type {ComputedProperty<String>}
   */
  createTriggerTip: computed('creationDisabledReason', function createTriggerTip() {
    const creationDisabledReason = this.get('creationDisabledReason');
    if (creationDisabledReason) {
      return this.t(
        `disabledCreateTriggerTip.${creationDisabledReason}`, {}, {
          defaultValue: '',
        });
    }
    return '';
  }),

  /**
   * @type {ComputedProperty<Number|undefined>}
   */
  tagsLimitForEditor: computed('tagsLimit', 'tags.length', function tagsLimitForEditor() {
    const {
      tags,
      tagsLimit,
    } = this.getProperties('tags', 'tagsLimit');

    if (Number.isInteger(tagsLimit)) {
      const normalizedTagsLimit = Math.max(tagsLimit, 0);
      return Math.max(normalizedTagsLimit - get(tags || [], 'length'), 0);
    }
  }),

  /**
   * @type {ComputedProperty<Array<Tag>>}
   */
  newTagsToHighlight: computed(() => []),

  /**
   * Tags from `tags` which are the same as tags in `newTagsToHighlight`
   * @type {ComputedProperty<Array<Tag>>}
   */
  currentTagsToHighlight: computed(
    'newTagsToHighlight.@each.{icon,label}',
    'tags.@each.{icon,label}',
    function currentTagsToHighlight() {
      const {
        newTagsToHighlight,
        tags,
      } = this.getProperties('newTagsToHighlight', 'tags');

      return tags.filter(tag => {
        const {
          label,
          icon,
        } = getProperties(tag, 'label', 'icon');
        return newTagsToHighlight.filterBy('label', label).isAny('icon', icon);
      });
    }
  ),

  allowModificationObserver: observer(
    'allowModification',
    function allowModificationObserver() {
      if (!this.get('allowModification')) {
        this.endTagCreation();
      }
    }
  ),

  disabledObserver: observer('disabled', function disabledObserver() {
    if (this.get('disabled')) {
      this.endTagCreation();
    }
  }),

  allowCreationObserver: observer('allowCreation', function allowCreationObserver() {
    const {
      isCreatingTag,
      allowCreation,
    } = this.getProperties('isCreatingTag', 'allowCreation');

    if (!allowCreation && isCreatingTag) {
      this.endTagCreation();
    }
  }),

  click(event) {
    this._super(...arguments);

    if (event.target === this.get('element')) {
      this.startTagCreation();
    }
  },

  keyDown(event) {
    if (['Enter', ' '].includes(event.key) && !this.get('isCreatingTag')) {
      this.startTagCreation();
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

  removeTagFromHighlighted(tag) {
    safeExec(this, () => {
      const newTagsToHighlight = this.get('newTagsToHighlight');
      const index = newTagsToHighlight.indexOf(tag);
      if (index > -1) {
        newTagsToHighlight.removeAt(index);
      }
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
      if (!this.get('allowCreation')) {
        return;
      } else if (this.get('isCreatingTag')) {
        // Focus editor - send focus to the root element of the editor and
        // let the editor to handle that focus on its own
        const event = document.createEvent('Event');
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
      this.get('newTagsToHighlight').pushObjects(newTagsToAdd);
      newTagsToAdd.forEach(newTag =>
        later(
          this,
          'removeTagFromHighlighted',
          newTag,
          config.environment === 'test' ? 1 : 1000
        )
      );

      onChange((tags || []).concat(newTagsToAdd).uniq());
    },
  },
});
