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
import { reads } from '@ember/object/computed';
import $ from 'jquery';

export default Component.extend({
  layout,
  classNames: ['tags-input-text-editor'],
  classNameBindings: ['lastTagNotMatchRegexp:has-error'],

  /**
   * @virtual optional
   * @type {Object}
   *
   * Supported settings: {
   *   separators: Array<String> - tag separators, default [',']
   *   regexp: RegExp - if passed, then each new tag must match regexp to be accepted
   *   transform: Function - if passed, will transform each new tag label before sending it
   *     to the tags-input. Gets label as an argument, and should return a transformed label.
   * }
   */
  settings: undefined,

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
   * @type {ComputedProperty<Array<String>>}
   */
  separators: or('settings.separators', [',']),

  /**
   * @type {ComputedProperty<RegExp>}
   */
  regexp: or('settings.regexp', /^.*$/),

  /**
   * @type {ComputedProperty<Function>}
   */
  transform: or('settings.transform', label => label),

  /**
   * @type {ComputedProperty<String>}
   */
  placeholder: reads('settings.placeholder'),

  /**
   * @type {ComputedProperty<String>}
   */
  inputValue: '',

  /**
   * @type {boolean}
   */
  lastTagNotMatchRegexp: false,

  focusIn(event) {
    if (!$(event.target).hasClass('text-editor-input')) {
      // Redirect component focus to text input
      const input = this.getInput();
      if (input) {
        input.focus();
      }
    }
  },

  didInsertElement() {
    this._super(...arguments);

    const input = this.getInput();
    if (input) {
      input.focus();
    }
  },

  extractTagsLabels(value, acceptLastWithoutSeparator) {
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
      let nextSeparatorIdx = Math.min(...separators
        .map(sep => valueToProcess.indexOf(sep))
        .without(-1)
      );
      if (
        nextSeparatorIdx === Number.POSITIVE_INFINITY &&
        valueToProcess.length &&
        acceptLastWithoutSeparator
      ) {
        nextSeparatorIdx = valueToProcess.length;
      }
      if (nextSeparatorIdx !== Number.POSITIVE_INFINITY) {
        const label = valueToProcess.slice(0, nextSeparatorIdx).trim();
        if (!label || regexp.test(label)) {
          if (label) {
            labels.push(label);
          }
          valueToProcess = valueToProcess.slice(nextSeparatorIdx + 1);
        } else {
          nextInputValue = valueToProcess;
          if (label) {
            this.set('lastTagNotMatchRegexp', true);
          }
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

  processNewTags(value, acceptLastWithoutSeparator) {
    // Reset validation
    this.set('lastTagNotMatchRegexp', false);

    const {
      onTagsAdded,
      transform,
    } = this.getProperties('onTagsAdded', 'transform');

    const {
      labels,
      nextInputValue,
    } = this.extractTagsLabels(value, acceptLastWithoutSeparator);

    const tagsToAdd = labels.map(label => ({ label: transform(label) }));

    if (tagsToAdd.length) {
      onTagsAdded(tagsToAdd);
    }
    this.set('inputValue', nextInputValue);

    if (!nextInputValue) {
      // When input was empty and after filling it in with string "sthsth,"
      // it again becomes empty, then ember does not clean the input value
      // because `newTags.firstObject.label` (input value) was empty all the time.
      const input = this.getInput();
      if (input) {
        input.value = '';
      }
    }
  },

  getInput() {
    const element = this.get('element');
    return element ? element.querySelector('.text-editor-input') : null;
  },

  actions: {
    inputChanged(value) {
      this.processNewTags(value, false);
    },
    acceptTags() {
      this.processNewTags(this.get('inputValue'), true);
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
