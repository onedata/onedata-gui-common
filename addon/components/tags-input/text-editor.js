/**
 * A tags (tokenizer) input editor, which allows to add tags using simple text input.
 * Tags are added after separator character detection or on Enter keydown.
 * 
 * @module components/tags-input/text-editor
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/tags-input/text-editor';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { or } from 'ember-awesome-macros';
import $ from 'jquery';

export default Component.extend({
  layout,
  classNames: ['tags-input-text-editor'],

  /**
   * @public
   * @virtual
   * @type {Object}
   * 
   * Supported settings: {
   *   separators: Array<String> - tag separators, default [',']
   *   regexp: RegExp - if passed, then each new tag must match regexp to be accepted
   * }
   */
  settings: undefined,

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
  inputValue: '',

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
    const {
      separators,
      regexp,
    } = this.getProperties(
      'separators',
      'regexp',
    );

    const labels = [];
    let valueToProcess = value;
    let nextInputValue;

    while (nextInputValue === undefined) {
      const nextSeparatorIdx = Math.min(...separators
        .map(sep => valueToProcess.indexOf(sep))
        .without(-1)
      );
      if (nextSeparatorIdx !== Number.POSITIVE_INFINITY) {
        const label = valueToProcess.slice(0, nextSeparatorIdx).trim();
        if (!label || regexp.test(label)) {
          if (label) {
            labels.push(label);
          }
          valueToProcess = valueToProcess.slice(nextSeparatorIdx + 1);
        } else {
          nextInputValue = valueToProcess;
        }
      } else {
        nextInputValue = valueToProcess;
      }
    }

    return {
      labels,
      nextInputValue,
    };
  },

  actions: {
    inputChanged(value) {
      const {
        labels,
        nextInputValue,
      } = this.extractTagsLabels(value);

      const tagsToAdd = labels.map(label => ({ label }));

      if (tagsToAdd.length) {
        this.get('onTagsAdded')(tagsToAdd);
      }
      this.set('inputValue', nextInputValue);

      if (!nextInputValue) {
        // When input was empty and after filling it in with string "sthsth,"
        // it again becomes empty, then ember does not clean the input value
        // because `newTags.firstObject.label` (input value) was empty all the time.
        this.$('.text-editor-input').val('');
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
