/**
 * A tags (tokenizer) input editor, which allows to add tags using external editor
 * component. The external editor component is being informed about creation status
 * using `startTagCreationCallback` and `endTagCreationCallback` functions passed
 * via editor settings. Actions performed inside external editor component can be
 * applied to the tags-input using callbacks passed in `startTagCreationCallback`
 * invocation.
 *
 * @module components/tags-input/external-editor
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/tags-input/external-editor';
import { reads } from '@ember/object/computed';

export default Component.extend({
  layout,
  classNames: ['tags-input-external-editor'],

  /**
   * @virtual
   * @type {Function}
   * @param {Array<Tag>} tagsToAdd
   * @returns {any}
   */
  onTagsAdded: undefined,

  /**
   * @virtual
   * @type {Function}
   * @returns {any}
   */
  onEndTagCreation: undefined,

  /**
   * Limit of tags, that are allowed to be added at once.
   * @type {Number|undefined}
   */
  tagsLimit: undefined,

  /**
   * @virtual
   * @type {Object}
   *
   * Supported settings:
   * ```
   * {
   *   startTagCreationCallback: Function, // Notifies the external editor component,
   *     // that tags creation process should start. This callback should accept
   *     // one argument - an object with fields:
   *     // ```
   *     // {
   *     //   onTagsAddedCallback: Function // should be called by the external editor
   *     //     // when new tags are going to be added. Accepts one argument - array
   *     //     // of new tags.
   *     //   onEndTagCreationCallback: Function // should be called by the external
   *     //     // editor when creation process should been ended.
   *     //   tagsLimit: Number|undefined // if available, specifies the maximum
   *     //     // number of tags, that can be created.
   *     // }
   *     // ```
   *   endTagCreationCallback: Function // Notifies the external editor component,
   *     // that tags creation process should be ended.
   * }
   * ```
   */
  settings: undefined,

  /**
   * @type {ComputedProperty<Function>}
   */
  startTagCreationCallback: reads('settings.startTagCreationCallback'),

  /**
   * @type {ComputedProperty<Function>}
   */
  endTagCreationCallback: reads('settings.endTagCreationCallback'),

  didInsertElement() {
    this._super(...arguments);

    this.startTagCreation();
  },

  willDestroyElement() {
    try {
      this.endTagCreation();
    } finally {
      this._super(...arguments);
    }
  },

  startTagCreation() {
    const {
      startTagCreationCallback,
      onTagsAdded,
      onEndTagCreation,
      tagsLimit,
    } = this.getProperties(
      'startTagCreationCallback',
      'onTagsAdded',
      'onEndTagCreation',
      'tagsLimit'
    );

    if (!startTagCreationCallback || !onTagsAdded || !onEndTagCreation) {
      return;
    }

    startTagCreationCallback({
      onTagsAddedCallback: onTagsAdded,
      onEndTagCreationCallback: onEndTagCreation,
      tagsLimit,
    });
  },

  endTagCreation() {
    const endTagCreationCallback = this.get('endTagCreationCallback');
    endTagCreationCallback && endTagCreationCallback();
  },
});
