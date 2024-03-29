/**
 * A tags (tokenizer) input, which allows adding and removing tags. New tags
 * are added through dedicated tags editors which can be specified using
 * tagEditorComponentName property.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/tags-input';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { later } from '@ember/runloop';
import {
  computed,
  observer,
  get,
  getProperties,
} from '@ember/object';
import {
  writable,
  conditional,
  not,
  or,
  and,
  raw,
  difference,
  gt,
} from 'ember-awesome-macros';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import config from 'ember-get-config';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import $ from 'jquery';
import globals from 'onedata-gui-common/utils/globals';

/**
 * @typedef {Object} Tag
 * @property {string} label
 * @property {string} [icon]
 * @property {string} [className]
 * @property {string} [tip]
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
    'allowCreation::creation-disabled',
    'isClearButtonEffectivelyVisible:has-clear-button',
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
   * @virtual
   * @type {Array<Tag>}
   */
  tags: undefined,

  /**
   * @virtual optional
   * @type {ComputedProperty<number>}
   */
  tabindex: writable(conditional('disabled', raw(undefined), raw(0))),

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
   * @virtual optional
   * @type {Boolean}
   */
  isClearButtonVisible: false,

  /**
   * @virtual optional
   * @type {SafeString|string}
   */
  editPlaceholder: undefined,

  /**
   * If provided, limits number of tags. When the number of existing tags
   * is greater than or equal to the limit, then creating new tags
   * becomes disabled.
   * @virtual optional
   * @type {Number}
   */
  tagsLimit: undefined,

  /**
   * If provided, limits tags displayed in readonly mode. When number of tags exceed
   * this number, the "more tags" text is displayed with tooltip showing the rest of tags.
   * @virtual optional
   * @type {number}
   */
  readonlyTagsDisplayLimit: undefined,

  /**
   * @virtual optional
   * @type {string}
   */
  tagEditorComponentName: 'tags-input/text-editor',

  /**
   * @virtual optional
   * @type {boolean}
   */
  startTagCreationOnInit: false,

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
   * @virtual optional
   * @type {(moreTagsCount: number) => SafeString|string}
   */
  onEvaluateMoreTagsText: undefined,

  /**
   * @type {boolan}
   */
  isCreatingTag: false,

  tagsLimitExceeded: and(
    'readonlyTagsDisplayLimit',
    gt('tags.length', 'readonlyTagsDisplayLimit')
  ),

  tagsDisplayedOnLimitExceed: difference('readonlyTagsDisplayLimit', 1),

  displayedTags: computed(
    'tags.[]',
    'readonly',
    'tagsLimitExceeded',
    'tagsDisplayedOnLimitExceed',
    function limitedTags() {
      if (this.readonly && this.tagsLimitExceeded) {
        return this.tags.slice(0, this.tagsDisplayedOnLimitExceed);
      } else {
        return this.tags;
      }
    }
  ),

  moreTags: computed(
    'tagsLimitExceeded',
    'tagsDisplayedOnLimitExceed',
    function moreTags() {
      if (this.tagsLimitExceeded) {
        return this.tags.slice(this.tagsDisplayedOnLimitExceed);
      } else {
        return [];
      }
    }
  ),

  moreTagsText: computed(
    'moreTags.length',
    'onEvaluateMoreTagsText',
    function moreTagsText() {
      if (typeof this.onEvaluateMoreTagsText === 'function') {
        return this.onEvaluateMoreTagsText(this.moreTags.length);
      } else {
        return this.t('moreTags', { count: this.moreTags.length });
      }
    }
  ),

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
  allowCreation: and(not('creationDisabledReason'), 'allowModification'),

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
   * @type {ComputedProperty<Boolean>}
   */
  isClearButtonEffectivelyVisible: and(
    'isClearButtonVisible',
    'tags.length',
    'allowModification'
  ),

  isPlaceholderEffectivelyVisible: and(
    'allowModification',
    'editPlaceholder',
    not('tags.length'),
    not('isCreatingTag'),
  ),

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

  init() {
    this._super(...arguments);
    if (!this.tags) {
      this.set('tags', []);
    }
  },

  didInsertElement() {
    this._super(...arguments);

    if (this.startTagCreationOnInit) {
      this.startTagCreation();
    }
  },

  click(event) {
    this._super(...arguments);

    if (event.target === this.get('element')) {
      this.startTagCreation();
    }
  },

  keyDown(event) {
    if (['Enter', ' '].includes(event.key)) {
      this.startTagCreation();
    }
  },

  focusOut() {
    this._super(...arguments);

    later(this, () => {
      const element = this.get('element');
      const $element = element ? $(element) : null;
      if ($element && !$element.is(':focus') && !$element.find(':focus').length) {
        this.get('onFocusLost')();
      }
    }, 0);
  },

  startTagCreation() {
    const {
      isCreatingTag,
      allowCreation,
    } = this.getProperties(
      'isCreatingTag',
      'allowCreation'
    );

    if (allowCreation && !isCreatingTag) {
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
      const {
        element,
        isCreatingTag,
      } = this.getProperties('element', 'isCreatingTag');

      if (isCreatingTag) {
        // Focus editor - send focus to the root element of the editor and
        // let the editor to handle that focus on its own
        const event = globals.document.createEvent('Event');
        event.initEvent('focus', true, true);
        element.querySelector('.tag-creator > *').dispatchEvent(event);
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
    clearInput() {
      this.get('onChange')([]);
    },
  },
});
