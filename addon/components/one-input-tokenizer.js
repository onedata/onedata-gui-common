/**
 * Ember wrapper component for `input-tokenizer` jQuery plugin
 * 
 * @module components/one-input-tokenizer
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-input-tokenizer';
import { or } from '@ember/object/computed';
import { computed, observer } from '@ember/object';
import { scheduleOnce, debounce } from '@ember/runloop';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-ignore';
import $ from 'jquery';

export default Component.extend({
  layout,
  classNames: ['form-group', 'one-input-tokenizer'],
  classNameBindings: [
    'internalDisabled:disabled',
    'isBusy:busy',
  ],

  initialValue: undefined,

  placeholder: '',

  inputClass: '',

  isBusy: false,

  /**
   * @virtual
   * @type {string}
   */
  inputValue: '',

  /**
   * @virtual
   * @type {Array<string>}
   */
  tokens: Object.freeze([]),

  tokensChanged: notImplementedWarn,
  inputValueChanged: notImplementedWarn,

  internalDisabled: or('disabled', 'isBusy'),

  inputId: computed('elementId', function inputId() {
    return this.get('elementId') + '-input-tokenizer'
  }),

  internalDisabledChanged: observer('internalDisabled', function internalDisabledChanged() {
    const internalDisabled = this.get('internalDisabled');
    if (!internalDisabled) {
      scheduleOnce('afterRender', () => this.$('.tknz-input').focus());
    }
  }),

  init() {
    this._super(...arguments);
  },

  didInsertElement() {
    this._super(...arguments);
    this.initInputTokenizer();
    $(window).on(`resize.${this.elementId}`, () => debounce(this, 'adjustHeight', 100));
    scheduleOnce('afterRender', () => this.adjustHeight());
  },

  willDestroyElement() {
    this._super(...arguments);
    $(window).off(`.${this.elementId}`);
  },

  // TODO: currently only makes input larger, not smaller
  adjustHeight() {
    /** @type {HTMLElement} */
    const inputWrapper = this.$('.tknz-input-wrapper')[0];
    /** @type {HTMLElement} */
    const wrapper = this.$('.tknz-wrapper')[0];
    if (inputWrapper.offsetTop + inputWrapper.offsetHeight > wrapper.offsetHeight) {
      const currentHeight = parseInt(window.getComputedStyle(wrapper).height);
      $(wrapper).css('height', currentHeight + 24 + 'px');
    }
  },

  getTokenInput() {
    return this.$(`#${this.get('inputId')}`);
  },

  tokensObserver: observer('tokens.[]', function tokensObserver() {
    const $tokenizer = this.getTokenInput();
    $tokenizer.tokenizer('empty');
    this.get('tokens').forEach(token => {
      $tokenizer.tokenizer('push', token);
    });
    scheduleOnce('afterRender', () => this.adjustHeight());
  }),

  inputObserver: observer('inputValue', function inputObserver() {
    this.getTokenInput().val(this.get('inputValue'));
  }),

  initInputTokenizer() {
    const $tokenInput = this.getTokenInput();

    $tokenInput.tokenizer({
      placeholder: this.get('placeholder'),
      separators: [',', ';', ' '],
      label: '',
      callback: ($input) => {
        this.get('tokensChanged')($input.tokenizer('get'));
        this.inputObserver();
      },
    });

    $tokenInput.on('inputValue', event => {
      this.get('inputValueChanged')(event.currentTarget.value);
    });

    // prevent invoking "back" in Firefox when pressing backspace
    this.$().on('keydown', event => {
      if (event.which === 8) {
        event.stopPropagation();
      }
    });

    scheduleOnce('afterRender', () => {
      this.inputObserver();
      this.tokensObserver();
    });
  },

});
